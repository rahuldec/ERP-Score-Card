export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const mobile = process.env.VITE_ERP_MOBILE;
  const password = process.env.VITE_ERP_PASSWORD;

  try {
    const upstream = await fetch('https://others-api.odpay.in/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
