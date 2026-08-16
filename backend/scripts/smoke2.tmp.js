const BASE = 'http://localhost:5000/api';
(async () => {
  const r1 = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vikas.com', password: 'admin123' }),
  });
  const b1 = await r1.json();
  const token = b1.token || (b1.data && b1.data.token);
  console.log('login(admin@vikas.com):', r1.status, token ? 'token ok' : JSON.stringify(b1));
  if (!token) process.exit(1);

  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  const r2 = await fetch(`${BASE}/cart`, {
    method: 'POST', headers: auth(),
    body: JSON.stringify({ productId: 'SHOFTURVE4VZZWCF', quantity: 1 }),
  });
  console.log('POST /cart:', r2.status, JSON.stringify(await r2.json()).slice(0, 200));

  const r3 = await fetch(`${BASE}/reservations/create`, {
    method: 'POST', headers: auth(),
    body: JSON.stringify({ productId: 'SHOFTURVE4VZZWCF', quantity: 1, storeId: 'store-01', slotTime: '2026-08-20T14:00:00.000Z' }),
  });
  console.log('POST /reservations/create:', r3.status, JSON.stringify(await r3.json()).slice(0, 200));
  process.exit(0);
})();