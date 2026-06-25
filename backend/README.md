# Cabuk Backend

## Start

```bash
npm install
npm start
```

The production server entrypoint is `server.js`.

## OVH Deployment

Recommended process manager: PM2 with `ecosystem.config.cjs`.

### PM2 Deploy

Run these commands on the OVH server inside the backend directory:

```bash
cd /var/www/cabuk/backend
git pull
npm ci
cp -n .env.example .env
pm2 startOrRestart ecosystem.config.cjs --only cabuk-backend
pm2 save
npm run verify:deploy -- http://127.0.0.1:3000
```

If PM2 is not installed yet:

```bash
npm install -g pm2
cd /var/www/cabuk/backend
pm2 start ecosystem.config.cjs --only cabuk-backend
pm2 save
pm2 startup
```

### Manual Restart

If the server is not managed by PM2, use:

```bash
cd /var/www/cabuk/backend
git pull
npm ci
cp -n .env.example .env
pkill -f "node server.js" || true
nohup npm start > backend.log 2>&1 &
npm run verify:deploy -- http://127.0.0.1:3000
```

### Verify Public Access

Run from the OVH box after restart:

```bash
curl http://127.0.0.1:3000/health
curl http://135.125.184.123:3000/health
curl -X POST http://127.0.0.1:3000/auth/login -H "Content-Type: application/json" -d "{}"
```

- Make sure the OVH process runs `npm start` or `node server.js`.
- If the server is launched via `tsx src/index.ts`, that entrypoint now bootstraps `server.js` as well.
- The auth endpoints are available at `/auth/signup` and `/auth/login`.
- Health checks use `/health`.
