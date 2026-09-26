import { useState } from 'react';
import { fetchDashboard } from './api';
import { ENTITIES } from './config';
import type { EntityDashboard } from './types';
import EntityCard from './components/EntityCard';

export default function App() {
  const [token, setToken] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [dashboards, setDashboards] = useState<EntityDashboard[]>([]);
  const [fetching, setFetching] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const initDashboards = () =>
    ENTITIES.map(entity => ({ entity, data: null, error: null, loading: true }));

  const loadData = async (tok: string) => {
    setFetching(true);
    setDashboards(initDashboards());
    const results = await Promise.all(
      ENTITIES.map(async entity => {
        try {
          const data = await fetchDashboard(tok, entity.id, entity.session);
          return { entity, data, error: null, loading: false };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch';
          return { entity, data: null, error: msg, loading: false };
        }
      })
    );
    setDashboards(results);
    setLastRefresh(new Date());
    setFetching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tok = inputToken.trim();
    if (!tok) return;
    setToken(tok);
    loadData(tok);
  };

  const totalStudents = dashboards.reduce((sum, d) => {
    if (!d.data) return sum;
    return sum + (d.data.headCount.currentSession[0]?.totalStudents ?? 0);
  }, 0);

  const totalActive = dashboards.reduce((sum, d) => {
    if (!d.data) return sum;
    return sum + (d.data.awakeDormantCount[0]?.awakeStudents ?? 0);
  }, 0);

  const totalNew = dashboards.reduce((sum, d) => {
    if (!d.data) return sum;
    return sum + (d.data.headCount.currentSession[0]?.newAdmission ?? 0);
  }, 0);

  const totalQueries = dashboards.reduce((sum, d) => {
    if (!d.data) return sum;
    return sum + (d.data.unresolvedODPayQueries ?? 0);
  }, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1e1b4b', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60, gap: 16 }}>
          <span style={{ fontSize: 20 }}>🏫</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.3 }}>ERP Score Card</div>
            <div style={{ fontSize: 11, color: '#a5b4fc' }}>Student Overview Dashboard</div>
          </div>
          {lastRefresh && (
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#a5b4fc' }}>
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
        {/* Token form */}
        {!token ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, margin: '80px auto', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#111827' }}>Enter Auth Token</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Paste your JWT token from the ERP system to load student overview data.</p>
            <form onSubmit={handleSubmit}>
              <textarea
                value={inputToken}
                onChange={e => setInputToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                style={{
                  width: '100%',
                  height: 100,
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={!inputToken.trim()}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '12px',
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Load Dashboard
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            {!fetching && dashboards.some(d => d.data) && (
              <div style={{ background: '#fff', borderRadius: 12, padding: '16px 24px', marginBottom: 24, display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Total Students (All Entities)</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{totalStudents.toLocaleString()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Active Students</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{totalActive.toLocaleString()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>New Admissions</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#0891b2' }}>{totalNew.toLocaleString()}</div>
                </div>
                {totalQueries > 0 && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Unresolved Queries</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{totalQueries}</div>
                  </div>
                )}
                <button
                  onClick={() => loadData(token)}
                  disabled={fetching}
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                    color: '#374151',
                  }}
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={() => { setToken(''); setDashboards([]); }}
                  style={{
                    padding: '8px 16px',
                    background: '#fee2e2',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                    color: '#dc2626',
                  }}
                >
                  Change Token
                </button>
              </div>
            )}

            {/* Entity cards */}
            {dashboards.map((ed, i) => (
              <EntityCard key={i} ed={ed} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
