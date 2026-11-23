# TapCampus — API

NestJS 12 + Prisma 7 (PostgreSQL), BullMQ (Redis) y Socket.io. Módulos en `src/`, esquema y migraciones en `prisma/`, scripts de verificación y seed en `scripts/`.

Desde esta carpeta:

```powershell
npm ci
copy .env.example .env   # rellena DATABASE_URL, JWT_SECRET y REDIS_URL
docker compose up -d     # PostgreSQL (puerto 6000) y Redis (6379) locales
npm run db:migrate:safe
npm run start:dev
```

`JWT_SECRET` es obligatorio: la API no arranca sin él. Genera uno aleatorio, por ejemplo con `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Nunca subas `.env` al repositorio.

Datos de demostración: `npm run db:seed:delivery` (las contraseñas quedan en `.local/demo-access.json`, ignorado por git). Consulta [la guía de entrega](../docs/11_DELIVERY_GUIDE.md).

Comprobaciones:

```powershell
npm run lint
npm test
npm run build
```

Despliegue: `render.yaml` en la raíz del repositorio construye `Dockerfile`; Render genera `JWT_SECRET` y `SEED_DEMO_PASSWORD` automáticamente.
