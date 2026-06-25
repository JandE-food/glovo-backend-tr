const baseUrl = (process.argv[2] ?? process.env.BACKEND_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');

const checks = [
  {
    name: 'health',
    path: '/health',
    method: 'GET',
    expectedStatuses: [200]
  },
  {
    name: 'restaurants',
    path: '/restaurants',
    method: 'GET',
    expectedStatuses: [200]
  },
  {
    name: 'addresses',
    path: '/addresses?userId=deploy-check',
    method: 'GET',
    expectedStatuses: [200]
  },
  {
    name: 'auth-signup-route',
    path: '/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}),
    expectedStatuses: [400, 409]
  },
  {
    name: 'auth-login-route',
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}),
    expectedStatuses: [400, 401]
  }
];

const runCheck = async (check) => {
  const response = await fetch(`${baseUrl}${check.path}`, {
    method: check.method,
    headers: check.headers,
    body: check.body
  });

  if (!check.expectedStatuses.includes(response.status)) {
    const body = await response.text();
    throw new Error(
      `${check.name} failed with status ${response.status}${body ? `: ${body}` : ''}`
    );
  }

  return response.status;
};

const main = async () => {
  console.log(`Verifying backend deployment at ${baseUrl}`);

  for (const check of checks) {
    const status = await runCheck(check);
    console.log(`OK ${check.name} -> ${status}`);
  }

  console.log('Deployment verification passed.');
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Deployment verification failed: ${message}`);
  process.exit(1);
});
