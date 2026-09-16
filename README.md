# Spatial Intelligence Platform

> **Vision**: *"AI that understands, navigates, and operates physical spaces."*

A production-grade, multi-tenant enterprise platform connecting physical topologies, asset registers, operational schedules, and conversational AI agents.

---

## 🏛️ Monorepo Structure

```
├── apps/
│   ├── web/                     # Next.js 14 Web Application (Cartography, AI Chat, Dashboard)
│   └── api/                     # NestJS / Node.js Modular Backend API
├── packages/
│   ├── types/                   # Shared TypeScript interfaces & DTOs
│   ├── spatial-graph/           # Graph topology algorithms, A* pathfinding & ontology
│   └── database/                # Prisma schema with PostGIS & pgvector migrations
├── docs/                        # Specifications and design assets
├── docker-compose.yml           # Local PostgreSQL 16 + PostGIS & Redis stack
└── PRODUCT_BLUEPRINT.md         # Comprehensive 18-part technical architecture blueprint
```

---

## 🚀 Quick Start

### 1. Start Infrastructure
Ensure Docker is running, then start the PostgreSQL (PostGIS) and Redis containers:
```bash
npm run docker:up
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Database Initialization
```bash
npm run db:migrate
npm run db:seed
```

### 4. Run Development Servers
```bash
npm run dev
```

The web client will be available at `http://localhost:3000` and the API at `http://localhost:4000/api/v1`.

---

## 📖 Complete Blueprint
For full system diagrams, database ER models, API definitions, security architecture, and multi-tenant SaaS strategy, see [PRODUCT_BLUEPRINT.md](PRODUCT_BLUEPRINT.md).
