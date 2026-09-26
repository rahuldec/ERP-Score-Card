export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { entity, session, token } = req.query;
  if (!entity || !session || !token) {
    return res.status(400).json({ message: 'Missing entity, session or token' });
  }

  try {
    const url = `https://others-api.odpay.in/api/getSISDashboard/dashboard?entity=${encodeURIComponent(entity)}&session=${encodeURIComponent(session)}`;
    const upstream = await fetch(url, { headers: { Authorization: token } });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(500).json({ message: String(e) });
  }
}
