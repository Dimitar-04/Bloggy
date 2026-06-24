# Kubernetes Manifests

Replace `REPLACE_WITH_DOCKERHUB_USERNAME` in the backend and frontend Deployment manifests with your DockerHub username before applying.

These manifests assume the default Traefik Ingress controller included with k3d/k3s.

## Apply

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-mongo-secret.yaml
kubectl apply -f k8s/02-mongo-configmap.yaml
kubectl apply -f k8s/03-mongo-service.yaml
kubectl apply -f k8s/04-mongo-statefulset.yaml
kubectl apply -f k8s/04-mongo-init-replica-set-job.yaml
kubectl apply -f k8s/05-backend-secret.yaml
kubectl apply -f k8s/06-backend-configmap.yaml
kubectl apply -f k8s/07-backend-deployment.yaml
kubectl apply -f k8s/08-backend-service.yaml
kubectl apply -f k8s/09-frontend-configmap.yaml
kubectl apply -f k8s/10-frontend-deployment.yaml
kubectl apply -f k8s/11-frontend-service.yaml
kubectl apply -f k8s/12-ingress.yaml
```

Or apply everything in filename order:

```bash
kubectl apply -f k8s/
```

## Get Resources

```bash
kubectl get all -n blog-app
kubectl get pods -n blog-app
kubectl get services -n blog-app
kubectl get deployments -n blog-app
kubectl get statefulsets -n blog-app
kubectl get jobs -n blog-app
kubectl get pvc -n blog-app
kubectl get ingress -n blog-app
kubectl get configmaps -n blog-app
kubectl get secrets -n blog-app
```

## Logs

```bash
kubectl logs statefulset/mongo -n blog-app
kubectl logs job/mongo-init-replica-set -n blog-app
kubectl logs deployment/backend -n blog-app
kubectl logs deployment/frontend -n blog-app
```

## Local Reset

For a clean local k3d database, delete the namespace and apply the manifests again.

```bash
kubectl delete namespace blog-app
kubectl apply -f k8s/
```

This removes the MongoDB PVCs and deletes the local Kubernetes posts.

For one specific Pod:

```bash
kubectl get pods -n blog-app
kubectl logs <pod-name> -n blog-app
```
