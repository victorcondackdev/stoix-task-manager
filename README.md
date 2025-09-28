# Stoix — Task Manager (Express + Prisma + CSRF + Angular 20 + Tailwind)

Monorepo com **backend** (TypeScript/Express/Prisma/CSRF) e **frontend** (Angular 20 + Tailwind).
Inclui **Docker Compose** com Postgres, serviços do backend e frontend (dev/proxy).

## Rodando local (sem Docker)
1) Backend
```bash
cd apps/backend
cp .env.example .env
npm i
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

2) Frontend (Angular)
```bash
cd ../frontend
npm i
npm run start
```
Acesse http://localhost:4200

## Docker Compose (dev)
```bash
docker compose up --build
```
- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Postgres: localhost:5432 (user: postgres, pass: postgres, db: stoix)

> O `proxy.docker.json` encaminha `/api` do front para `http://backend:3000` dentro da rede do Compose.

## Notas de CSRF
- O front chama `GET /api/csrf` na inicialização para receber o cookie `XSRF-TOKEN` (SameSite=Lax).
- Em requisições não-GET, o interceptor envia `X-XSRF-TOKEN` (valor do cookie) com `withCredentials:true`.
- O backend valida com `csurf` e retorna 403 para tokens inválidos.

## Estrutura
```
apps/
  backend/
  frontend/
docker-compose.yml
```
