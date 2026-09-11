# Backend — SlothBoard Trainer API

NestJS REST API. It does not serve the React app. The SPA calls this process on a separate origin (CORS).

## Environment

Copy `.env.example` to `.env`. Required:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL URL (`localhost:5432` when Compose is up) |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `PORT` | Listen port (default `3000`) |
| `CORS_ORIGIN` | Comma-separated frontend origins (Vite dev `5173`, preview `4173`) |
| `SWAGGER_ENABLED` | Set `false` to disable Swagger |

PostgreSQL and pgAdmin run from the **workspace root** Compose file, not from this package.

## Local development

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

API: http://localhost:3000  
Swagger: http://localhost:3000/docs

## Production

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
npm run start:prod
```

`start:prod` runs `node dist/main` after `nest build`.

## CORS

The API enables CORS for origins in `CORS_ORIGIN`. There is no reverse proxy and no global `/api` prefix: routes are `/auth`, `/users`, `/sessions`, etc.
