export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const mobile = process.env.VITE_ERP_MOBILE;
  const password = process.env.VITE_ERP_PASSWORD;

  if (!mobile || !password) {
    return res.status(500).json({ message: 'Server credentials not configured' });
  }

  try {
    const upstream = await fetch('https://others-api.odpay.in/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password }),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(500).json({ message: String(e) });
  }
}
