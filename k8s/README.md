# Bloggy Kubernetes Architecture

These manifests run the Bloggy app in the `blog-app` namespace on Kubernetes. The stack contains three main parts:

- React frontend
- FastAPI backend
- MongoDB replica set

The local k3d cluster uses the default Traefik ingress controller from k3s.

## Namespace

All application resources live in one namespace:

```text
blog-app
```

This keeps the app resources grouped together instead of mixing them into the default namespace.

## Public Traffic Flow

Browser traffic enters the cluster through k3d's load balancer and Traefik.

```text
Browser
  -> localhost:8080
  -> k3d load balancer
  -> Traefik ingress controller
  -> Kubernetes Service
  -> Pod
```

The ingress has two responsibilities:

```text
/      -> frontend service
/api   -> backend service
```

The frontend is exposed at:

```text
http://localhost:8080
```

The backend API is exposed through the same host under:

```text
http://localhost:8080/api
```

## Frontend

The frontend runs as a Kubernetes `Deployment` with multiple replicas.

```text
frontend Deployment
  -> frontend Pod 1
  -> frontend Pod 2
```

The frontend `Service` is a `ClusterIP` service. It is only reachable inside the cluster. External traffic reaches it through Traefik, not directly.

The frontend image builds the React app first:

```text
npm run build
```

Then it serves the built output with:

```text
vite preview --host 0.0.0.0 --port 5173
```

This matters because multiple frontend replicas should serve stable built files. Running `vite dev` behind a load balancer can cause the browser to load development modules from different Pods, which can create React runtime errors.

The frontend calls the backend through:

```text
/api/posts
```

That keeps browser traffic on the same public origin:

```text
http://localhost:8080
```

## Backend

The backend runs as a Kubernetes `Deployment` with multiple replicas.

```text
backend Deployment
  -> backend Pod 1
  -> backend Pod 2
```

The backend `Service` is also a `ClusterIP` service. It gives the backend Pods one stable internal service name:

```text
backend
```

Traefik routes `/api` traffic to this service.

The backend container listens on:

```text
0.0.0.0:8000
```

The backend needs these environment variables:

```text
MONGO_URL
DATABASE_NAME
```

`DATABASE_NAME` comes from a ConfigMap because it is normal configuration.

`MONGO_URL` comes from a Secret because connection strings often contain credentials. In the current local learning setup, Mongo auth is not enabled, but the Secret keeps the deployment shape ready for a more secure version later.

## API Prefix Handling

The browser calls:

```text
/api/posts
```

But the FastAPI app defines routes like:

```text
/posts
/posts/{post_id}/comments
```

The backend does not define routes starting with `/api`.

Traefik uses a Middleware to strip the `/api` prefix before forwarding requests to the backend.

```text
Browser request:   /api/posts
Traefik forwards:  /posts
Backend route:     /posts
```

This lets the public URL clearly separate frontend and API traffic without changing the FastAPI route definitions.

## MongoDB

MongoDB runs as a `StatefulSet`, not a Deployment.

That matters because MongoDB needs stable identity and stable storage.

The StatefulSet creates Pods with predictable names:

```text
mongo-0
mongo-1
mongo-2
```

Each Mongo Pod gets its own persistent volume claim:

```text
mongo-data-mongo-0
mongo-data-mongo-1
mongo-data-mongo-2
```

The Mongo service is headless:

```yaml
clusterIP: None
```

A headless service does not create one load-balanced virtual IP. Instead, it gives stable DNS records for the individual StatefulSet Pods.

The backend connects to MongoDB using all replica-set members:

```text
mongodb://mongo-0.mongo:27017,mongo-1.mongo:27017,mongo-2.mongo:27017/?replicaSet=rs0
```

## Mongo Replica Set

The three Mongo Pods are configured as one MongoDB replica set named:

```text
rs0
```

The StatefulSet starts each Mongo container with:

```text
mongod --replSet rs0 --bind_ip_all
```

The init Job then runs `rs.initiate(...)` and registers:

```text
mongo-0.mongo:27017
mongo-1.mongo:27017
mongo-2.mongo:27017
```

After initialization, Mongo elects:

```text
one PRIMARY
two SECONDARY members
```

Writes go to the primary. The secondaries replicate the data from the primary.

This is why three Mongo replicas now behave like one database instead of three separate databases.

## Why The Earlier 3-Replica Mongo Setup Lost Posts

Running this:

```text
Mongo StatefulSet with replicas: 3
```

is not enough by itself.

Without replica-set configuration, the Pods are just three independent MongoDB servers:

```text
mongo-0 -> database A
mongo-1 -> database B
mongo-2 -> database C
```

That means a post could be created on one Mongo Pod, then a later comment request could hit another Mongo Pod that does not have that post. The result looked like random missing posts or 404 responses.

The replica set fixes that by making the Pods coordinate as one database.

## Storage Behavior

Each Mongo Pod uses `ReadWriteOnce` persistent storage.

That means each volume is mounted read-write by one node at a time.

This is correct for MongoDB because each Mongo Pod needs its own database files. The Pods should not all write to the same disk.

Data survives:

```text
Mongo Pod restart
Backend restart
Frontend restart
Deployment rollout
StatefulSet Pod recreation
```

Data does not survive deleting the k3d cluster unless external host-mounted storage is configured.

## Internal Service Names

Inside the cluster, Pods do not call each other through `localhost`.

Useful internal names are:

```text
frontend
backend
mongo
mongo-0.mongo
mongo-1.mongo
mongo-2.mongo
```

`localhost` inside a Pod means that same Pod, not another service.

## Replica Summary

Current intended replica model:

```text
frontend: 2 replicas
backend:  2 replicas
mongo:    3 replicas as replica set rs0
```

The frontend and backend are stateless, so Kubernetes can load-balance requests between their Pods.

MongoDB is stateful, so it uses a StatefulSet, persistent volumes, stable DNS, and a replica set.
