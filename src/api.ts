import type { DashboardData } from './types';

const API_BASE = 'https://others-api.odpay.in/api';

export async function fetchDashboard(
  token: string,
  entityId: string,
  session: string
): Promise<DashboardData> {
  const url = `${API_BASE}/getSISDashboard/dashboard?entity=${encodeURIComponent(entityId)}&session=${encodeURIComponent(session)}`;
  const res = await fetch(url, {
    headers: { Authorization: token },
  });
  const json = await res.json();
  if (json.message) throw new Error(json.message);
  return json as DashboardData;
}
