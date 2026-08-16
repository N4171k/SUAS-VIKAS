const BASE = 'http://localhost:5000/api';
const email = `smoke_${Date.now()}@vikas.com`;
const results = [];
const run = async (label, fn) => {
  try {
    const r = await fn();
    results.push({ label, ok: true, detail: JSON.stringify(r).slice(0, 160) });
  } catch (e) {
    results.push({ label, ok: false, detail: `${e.statusCode || ''} ${e.message}`.slice(0, 160) });
  }
};

(async () => {
  await run('POST /auth/register', async () => {
    const r = await fetch(`${BASE}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke Test', email, password: 'smoke123' }),
    });
    return { status: r.status, body: await r.json() };
  });

  await run('POST /auth/login', async () => {
    const r = await fetch(`${BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'smoke123' }),
    });
    const body = await r.json();
    global.token = body.token || (body.data && body.data.token);
    return { status: r.status, hasToken: !!global.token };
  });

  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${global.token}` });

  await run('GET /auth/me', async () => {
    const r = await fetch(`${BASE}/auth/me`, { headers: auth() });
    return { status: r.status, body: await r.json() };
  });

  await run('GET /products/:id', async () => {
    const r = await fetch(`${BASE}/products/SHOFTURVE4VZZWCF`);
    const body = await r.json();
    return { status: r.status, title: body.title, price: body.price };
  });

  await run('POST /cart/add', async () => {
    const r = await fetch(`${BASE}/cart/add`, {
      method: 'POST', headers: auth(),
      body: JSON.stringify({ productId: 'SHOFTURVE4VZZWCF', quantity: 1 }),
    });
    return { status: r.status, body: await r.json() };
  });

  await run('GET /cart', async () => {
    const r = await fetch(`${BASE}/cart`, { headers: auth() });
    return { status: r.status, body: await r.json() };
  });

  await run('POST /orders (buy-now)', async () => {
    const r = await fetch(`${BASE}/orders/buy-now`, {
      method: 'POST', headers: auth(),
      body: JSON.stringify({ productId: 'SHOFTURVE4VZZWCF', quantity: 1, storeId: 'store-01', paymentMethod: 'card', address: { line1: '1 Test St', city: 'Mumbai', state: 'MH', postalCode: '400001' } }),
    });
    return { status: r.status, body: await r.json() };
  });

  await run('GET /orders', async () => {
    const r = await fetch(`${BASE}/orders`, { headers: auth() });
    return { status: r.status, body: await r.json() };
  });

  await run('POST /reservations', async () => {
    const r = await fetch(`${BASE}/reservations`, {
      method: 'POST', headers: auth(),
      body: JSON.stringify({ productId: 'SHOFTURVE4VZZWCF', quantity: 1, storeId: 'store-01', slotTime: '2026-08-20T14:00:00.000Z' }),
    });
    return { status: r.status, body: await r.json() };
  });

  await run('POST /logout', async () => {
    const r = await fetch(`${BASE}/auth/logout`, { method: 'POST', headers: auth() });
    return { status: r.status, body: await r.json() };
  });

  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'} ${r.label}  →  ${r.detail}`);
  }
  process.exit(results.every((r) => r.ok) ? 0 : 1);
})();