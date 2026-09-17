# Spatial Intelligence Platform — V1 MVP

> **Vision**: *"AI that understands, navigates, and operates physical spaces."*  
> **Initial Vertical**: University & Higher Education Campuses  
> **Evolutionary Trajectory**: Campus → Hospital → Factory → Warehouse → Airport → Corporate HQ  

---

## 🏛️ Monorepo Architecture

```
campusAI/
├── apps/
│   ├── web/                     # Next.js 14 Web Frontend (2.5D Cartography, AI Assistant)
│   └── api/                     # NestJS Backend API (Spatial endpoints, AI Agent, Tools)
├── packages/
│   ├── types/                   # Shared TypeScript definitions, DTOs, and schemas
│   ├── spatial-graph/           # Graph topology ontology & multimodal A* indoor pathfinder
│   └── database/                # Prisma schema with PostGIS, init.sql, and seed dataset
├── docker-compose.yml           # Local PostgreSQL 16 (PostGIS) & Redis
├── .env.example                 # Environment configuration template
├── package.json                 # Monorepo workspace configuration
├── PRODUCT_BLUEPRINT.md         # Master 18-part architectural specification
└── V1_IMPLEMENTATION_AUDIT.md   # Full repository audit & acceptance verification report
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher (tested on `v24.14.0`)
- **Package Manager**: `npm v10+` (or `npm v11`)
- **Docker** (optional for containerized PostgreSQL/PostGIS)

### 2. Installation
Install all dependencies across workspaces:
```bash
npm install
```

### 3. Build Packages and Applications
```bash
npm run build
```

### 4. Running the Test Suite
Run the full suite of spatial graph routing tests and V1 acceptance tests:
```bash
npm test
```

### 5. Running the Application Locally

#### Backend API (Port 4000)
```bash
npm run dev --workspace=@spatial/api
```
Active endpoints at `http://localhost:4000/api/v1`:
- `GET /api/v1/spatial/campuses` - List tenant campuses
- `GET /api/v1/spatial/rooms/search?q=204` - Search rooms
- `GET /api/v1/spatial/navigation/route?origin=101&destination=204` - Calculate A* indoor route
- `GET /api/v1/spatial/assets/search?q=P-204` - Asset location lookup
- `POST /api/v1/ai/chat` - Natural language spatial conversational agent

#### Frontend Client (Port 3000)
```bash
npm run dev --workspace=@spatial/web
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the 2.5D campus map, floor switcher, and persistent AI conversational bar.

---

## 🤖 Conversational AI Queries (V1 Supported)

| Query Type | Example Prompt | Action Taken |
| :--- | :--- | :--- |
| **Spatial Search** | *"Where is Room 204?"* | Resolves Room 204 in Block B, Floor 2, highlights room on map. |
| **Indoor Navigation** | *"How do I get from Room 101 to Room 204?"* | Calculates A* route (54m, ~1.8 min), displays waypoints on map. |
| **Asset Intelligence** | *"Where is projector P-204?"* | Locates asset in Room 204, Floor 2, Block B; shows operational status. |
| **Timetable Query** | *"What is scheduled in Room 204?"* | Returns class schedules (*CS602 Deep Learning*, *CS704 Robotics*). |
| **Maintenance Report** | *"Create a maintenance ticket for the projector in Room 204"* | Creates incident ticket `TICK-XXXX` with `OPEN` status. |

---

## 🔒 Security & RBAC Guardrails
- **Controlled Tool Execution**: AI agent is restricted to validated Zod schemas. No arbitrary SQL or system commands.
- **Role Enforcement**: Maintenance status changes (`updateTicketStatus`) require `MAINTENANCE_STAFF` or `CAMPUS_ADMIN` privileges.
- **Tenant Scoping**: All campuses, buildings, and rooms belong to an isolated `organization_id`.

---

## 📍 V2 & V3 Feature Boundaries (Deferred)
The following features are purposefully deferred to future phases as defined in `PRODUCT_BLUEPRINT.md`:
- **V2**: Real-time IoT sensor ingestion, QR doorframe positioning, WebSockets push notifications.
- **V3**: Computer vision defect recognition, 3D WebGL digital twin, and autonomous energy agents.

---

For in-depth audit findings, implementation details, and test logs, see [V1_IMPLEMENTATION_AUDIT.md](V1_IMPLEMENTATION_AUDIT.md).
