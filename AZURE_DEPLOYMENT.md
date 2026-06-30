# Azure Deployment Notes

This file summarizes what was done to deploy the Bloggy application on Azure AKS, including the problems we hit and how we solved them.

## Goal

The goal was to run the existing Kubernetes version of the Bloggy app on Azure, using the same DockerHub images and Kubernetes manifests that were already working locally with k3d.

The application consists of:

- React/Vite frontend
- FastAPI backend
- MongoDB StatefulSet with 3 replicas
- Traefik Ingress
- ArgoCD for GitOps/CD

## 1. Azure Cloud Shell Setup

We used Azure Cloud Shell with Bash.

When Cloud Shell opened, Azure asked whether to mount a storage account. We selected:

```text
No storage account required
```

That was enough because we only needed a temporary shell session for `az`, `kubectl`, `helm`, and Git commands.

## 2. Checked Allowed Azure Regions

The student subscription had an Azure Policy limiting which regions could be used.

We checked the allowed locations with:

```bash
az policy assignment list \
  --query "[?parameters.listOfAllowedLocations].parameters.listOfAllowedLocations.value" \
  -o json
```

Allowed regions were:

```text
austriaeast
polandcentral
francecentral
spaincentral
italynorth
```

Setback:

An earlier command used `--all`, but the installed Azure CLI did not support that argument for this command.

Fix:

We removed `--all` and used the plain `az policy assignment list` command.

## 3. Resource Group

We created an Azure resource group for the deployment.

Initially, we tried using `italynorth`.

Example variables:

```bash
RG=bloggy-rg
LOC=italynorth
CLUSTER=bloggy-aks
```

Then:

```bash
az group create -n $RG -l $LOC
```

Later, because of VM quota and size issues, we moved the resource group to `austriaeast`.

## 4. AKS Cluster Creation

We wanted a small AKS cluster suitable for a student Azure subscription.

We checked available VM sizes with:

```bash
az vm list-sizes -l $LOC -o table
```

Setbacks:

Several VM sizes failed:

- `Standard_B4s_v2` was too large for the available quota.
- `Standard_D2s_v3` was not usable in the selected setup.
- `Standard_DC2s_v3` failed with insufficient vCPU quota in `italynorth`.
- Some regions had allowed policy but still did not have usable quota for the VM family.

Fix:

We changed region to `austriaeast` and used a smaller VM size:

```bash
az aks create \
  -g $RG \
  -n $CLUSTER \
  --node-count 1 \
  --node-vm-size Standard_B2s_v2 \
  --tier free \
  --generate-ssh-keys
```

This succeeded.

Important note:

The AKS cluster was created with one worker node. This is enough for demonstration, but it is not highly available.

## 5. Connected kubectl to AKS

After the cluster was created, we downloaded the kubeconfig credentials:

```bash
az aks get-credentials \
  -g $RG \
  -n $CLUSTER \
  --overwrite-existing
```

Then we verified the cluster:

```bash
kubectl get nodes
kubectl get pods -A
```

The node and system pods became `Ready` / `Running`.

## 6. Installed Traefik

In local k3d, Traefik was already available by default.

In AKS, Traefik is not installed by default, so we installed it with Helm:

```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm install traefik traefik/traefik \
  -n traefik \
  --create-namespace
```

Then we checked the service:

```bash
kubectl get svc -n traefik
```

Traefik received an external public IP address. That IP became the public entry point for the Bloggy application.

## 7. Applied Bloggy Kubernetes Manifests

We cloned the repository in Cloud Shell:

```bash
git clone https://github.com/Dimitar-04/Bloggy.git
cd Bloggy
```

Then applied the manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongo/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress/
```

The manifests created:

- namespace `blog-app`
- MongoDB StatefulSet
- MongoDB headless Service
- MongoDB ConfigMap and Secret
- backend Deployment and Service
- frontend Deployment and Service
- Traefik Ingress

We checked the app with:

```bash
kubectl get pods -n blog-app
kubectl get svc -n blog-app
kubectl get ingress -n blog-app
```

## 8. Verified the App

After Traefik got an external IP, the app was opened in the browser using:

```text
http://<traefik-external-ip>
```

The frontend loaded, posts could be created, and created posts survived browser refreshes.

Important note:

The Azure deployment had no old posts from Docker Compose or local k3d. This is expected because each environment has its own MongoDB storage:

- Docker Compose uses a local Docker volume.
- k3d uses local Kubernetes volumes.
- Azure AKS uses Azure-backed persistent volumes.

So the data is separate in each environment.

## 9. Installed ArgoCD on AKS

After the app was running manually, we installed ArgoCD so the Azure cluster could sync from the GitHub repository.

Created the namespace:

```bash
kubectl create namespace argocd
```

Installed ArgoCD:

```bash
kubectl apply --server-side \
  -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Setback:

Normal `kubectl apply` caused problems because some ArgoCD CRDs were too large for the normal client-side apply annotation.

Fix:

We used `--server-side`, which lets the Kubernetes API server manage the applied fields instead of storing a huge last-applied annotation.

Another setback:

Some ArgoCD pods temporarily had image pull/startup issues.

Fix:

We waited and checked pod status until the images pulled successfully and all ArgoCD pods became `Running`.

## 10. Accessed ArgoCD

At first, we tried accessing ArgoCD through Cloud Shell port forwarding and Web Preview.

Setback:

Cloud Shell Web Preview was confusing because port-forwarding binds to the Cloud Shell environment, not directly to the laptop browser. The preview sometimes showed redirects or refused connections.

Fix:

We exposed ArgoCD server temporarily with a LoadBalancer:

```bash
kubectl patch svc argocd-server \
  -n argocd \
  -p '{"spec":{"type":"LoadBalancer"}}'
```

Then checked the external IP:

```bash
kubectl get svc argocd-server -n argocd
```

After that, ArgoCD could be opened through the public IP.

For security and cost control, this can later be changed back to ClusterIP:

```bash
kubectl patch svc argocd-server \
  -n argocd \
  -p '{"spec":{"type":"ClusterIP"}}'
```

## 11. Logged in to ArgoCD

The default admin password was retrieved with:

```bash
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

Then we logged into the ArgoCD UI with:

```text
username: admin
password: value from the command above
```

## 12. Connected ArgoCD to the App

The repository already contained an ArgoCD Application manifest:

```text
argocd/bloggy-application.yaml
```

It points ArgoCD to:

- GitHub repo: `https://github.com/Dimitar-04/Bloggy.git`
- branch: `main`
- path: `k8s`
- destination namespace: `blog-app`

The important setting is:

```yaml
directory:
  recurse: true
```

This is needed because the Kubernetes manifests are grouped into subfolders:

```text
k8s/mongo
k8s/backend
k8s/frontend
k8s/ingress
```

Without recursive directory reading, ArgoCD would only see the root files and miss most of the app.

The Application also has auto-sync enabled with prune and self-heal, so ArgoCD can keep the cluster matching the Git repository.

## 13. Final Result

At the end, the Azure setup had:

- AKS cluster running in Azure
- Traefik exposing the app publicly
- Bloggy frontend, backend, and MongoDB running in namespace `blog-app`
- MongoDB using persistent storage
- ArgoCD installed in namespace `argocd`
- ArgoCD connected to the GitHub repository
- ArgoCD able to sync the Kubernetes manifests from Git

## 14. Cleanup

To avoid spending Azure credits after the demonstration, delete the resource group:

```bash
az group delete \
  -n $RG \
  --yes \
  --no-wait
```

This removes the AKS cluster, disks, public IPs, load balancers, and related Azure resources.

