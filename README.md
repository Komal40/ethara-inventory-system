# Ethara Inventory & Logistics Management System

A fully containerized, production-ready full-stack Inventory and Logistics Management System built using **FastAPI** for the backend, **React with Vite & TypeScript** for the frontend, and **PostgreSQL** as the core relational database. The entire ecosystem is orchestrating seamlessly using microservices network patterns via Docker Compose.

---

## 🚀 Live Production Links

* **Live Interactive Frontend URL:** https://ethara-inventory-system-komal40s-projects.vercel.app
* **Live REST API Documentation (Swagger UI):** https://ethara-inventory-system-kw4j.onrender.com/docs
* **GitHub Repository Source Link:** https://github.com/Komal40/ethara-inventory-system
* **Docker Hub Target Backend Base Image:** https://hub.docker.com/r/komal40/fastapi-backend

---

## 🛠️ Tech Stack & Architecture Architecture

### Frontend (User Interface)
* **Framework:** React 18 (Vite Bundler Engine)
* **Language:** TypeScript (Strict Type Safety configured)
* **Styling & UI:** Tailwind CSS & Lucide Icons
* **State Management & Networking:** Axios with dynamic production environment configurations

### Backend (RESTful Core API)
* **Framework:** FastAPI (Asynchronous Python framework)
* **ORM Layer:** SQLAlchemy Core with Pydantic schemas for atomic request payloads validation
* **Database:** PostgreSQL (Production engine utilizing explicit alphanumeric SKU indices)

### DevOps & Infrastructure
* **Containerization Engine:** Docker with slim/lightweight multi-stage builder platforms
* **Orchestration Network:** Docker Compose (Automated mesh networking with named persistent volumes)
* **Cloud Hosting:** Vercel (Frontend Edge Distribution) & Render (Docker Backend Service Deployment) & Neon.tech (Cloud PostgreSQL Ledger)

---

## 📁 System Core Directory Structure

```text
ethara-inventory-system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/         # Products, Customers, Orders, Dashboard routers
│   │   ├── core/                  # Database connections & credentials routing
│   │   ├── models/                # SQLAlchemy relational schemas
│   │   └── main.py                # FastAPI entrypoint initialization with CORS rules
│   ├── Dockerfile                 # Slim multi-stage Python compilation production asset
│   ├── .dockerignore              # Cache optimization excludes filter mask
│   └── requirements.txt           # Python application micro-dependencies manifest
├── frontend/
│   ├── src/
│   │   ├── components/            # Dashboard, Orders, and SKU tracking interface
│   │   └── App.tsx                # Client interface driver logic
│   ├── Dockerfile                 # Multi-stage static Node compilation to Nginx server
│   ├── .dockerignore              # Build boundary exclusion filters
│   └── tsconfig.app.json          # Production strict compiler optimization overrides
├── .env                           # Local environment orchestration guard (Never pushed to Git)
└── docker-compose.yml             # Full localized multi-tier system orchestration mesh
