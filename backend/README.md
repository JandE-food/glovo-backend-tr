# Cabuk Backend

## Start

```bash
npm install
npm start
```

The production server entrypoint is `server.js`.

## OVH Deployment

- Make sure the OVH process runs `npm start` or `node server.js`.
- If the server is launched via `tsx src/index.ts`, that entrypoint now bootstraps `server.js` as well.
- The auth endpoints are available at `/auth/signup` and `/auth/login`.
- Health checks use `/health`.
