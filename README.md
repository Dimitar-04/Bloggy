# Bloggy

Bloggy is a simple blog posting application with a React/Vite frontend, FastAPI backend, and MongoDB database. It was built as the final project for the DevOps course at FCSE Skopje.

## Docker

Docker Compose is used for local development, running the frontend, backend, and MongoDB together. Local environment values are loaded from `.env`.

## Kubernetes

Kubernetes manifests are stored in `k8s/` and deploy the app into the `blog-app` namespace. The setup includes Deployments for frontend/backend, a MongoDB StatefulSet, Services, ConfigMaps, Secrets, and Traefik Ingress.

## CI/CD

GitHub Actions builds and tests the project, then publishes versioned Docker images to DockerHub. ArgoCD can sync the Kubernetes manifests from the repository to a cluster.

## Azure

The app was deployed to Azure Kubernetes Service using the same Kubernetes manifests. Traefik was used to expose the application externally.
