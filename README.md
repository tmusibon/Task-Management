# TaskMaster – Task Management App

Full-stack task management: register, login, and manage tasks (create, list, filter, edit, delete) with a React frontend and Express + PostgreSQL backend.

## Prerequisites

- Node.js 18+
- PostgreSQL (local or Docker)

## Database setup

1. Create a database (e.g. `taskmaster`).
2. Run the schema:

```bash
psql -U postgres -d taskmaster -f server/src/models/init.sql
```

Or from the project root:

```bash
cd server && psql -U postgres -d taskmaster -f src/models/init.sql
```

## Backend (server)

```bash
cd server
cp .env.example .env
# Edit .env with your DB and JWT_SECRET
npm install
npm run dev
```

API runs at **http://localhost:3001**.  
Health: `GET http://localhost:3001/` → "TaskMaster API is running".

## Frontend (client)

```bash
cd client
npm install
npm start
```

App runs at **http://localhost:3000**.  
Use **http://localhost:3001** for API (or set `REACT_APP_API_URL=http://localhost:3001/api` if you use a different port).

## Docker (recommended)

From the project root:

```bash
docker compose up --build
```

Then open **http://localhost:3000** for the app and **http://localhost:3001** for the API. The database is initialized automatically on first run.

To run in the background: `docker compose up -d --build`.

## Usage

1. Open http://localhost:3000.
2. Register a new account or log in.
3. Use **Dashboard** for task stats and recent tasks.
4. Use **Tasks** to list, filter, sort, create, edit, and delete tasks.
