Real-Time Chat Application with Microservices
A real-time chat application built using a microservices architecture, deployed on Kubernetes (Minikube) with automated CI/CD using GitHub Actions. Demonstrates core DevOps practices including containerization, orchestration, and automated deployment.

Features
  - Real-time messaging using WebSocket (Socket.IO)
  - Microservices architecture with separate backend and frontend
  - Containerized with Docker for portability
  - Deployed on Kubernetes (Minikube) for orchestration
  - Automated CI/CD pipeline with GitHub Actions
  - Redis for session storage 

Technologies
  - Node.js/Socket.IO: Real-time backend
  - React: Frontend UI
  - Docker: Containerization
  - Kubernetes (Minikube): Container orchestration
  - GitHub Actions: CI/CD pipeline
  - Redis: Session storage 

Prerequisites
  - Node.js 18+
  - Docker
  - Minikube
  - Git
  - Docker Hub account

Setup and Running Locally
Option 1: Run with Docker Compose
Clone the repository:git clone https://github.com/van49785/chat-app.git
cd chat-app

Run all services: docker-compose up --build

Access frontend at http://localhost
Backend health check at http://localhost:3000/health

Option 2: Run with Minikube

Start Minikube: minikube start


Deploy to Kubernetes: kubectl apply -f k8s/
minikube service chat-frontend

Access the frontend via the URL provided by Minikube.
Test real-time messaging by sending messages in multiple browser tabs.

CI/CD Pipeline
Trigger: Runs on push to main branch
Steps:
Builds and pushes backend/frontend Docker images to Docker Hub
Ready for Kubernetes deployment (manual kubectl apply for Minikube)

Configuration:
Store DOCKER_USERNAME and DOCKER_PASSWORD in GitHub Secrets

Docker Hub Notes:
Images are pushed as thaovan01320/chat-app-backend:latest 
Kubernetes manifests (k8s/) use the same image names for consistency

Verifying Stability
To confirm the application runs stably on Kubernetes:

Check Deployments: kubectl get deployments

Ensure READY is 2/2 for chat-backend and chat-frontend.

Check Pods: kubectl get pods

Check Services: kubectl get services
minikube service chat-frontend

View Logs: kubectl logs -l app=chat-backend
kubectl logs -l app=chat-frontend
