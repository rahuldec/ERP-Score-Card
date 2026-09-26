import { useEffect, useRef, useState } from 'react';
import { login, fetchAllDashboards } from './api';
import type { EntityConfig } from './types';
import EntityCard from './components/EntityCard';
import type { EntityDashboard } from './types';

const DEFAULT_MOBILE = import.meta.env.VITE_ERP_MOBILE ?? '';
const DEFAULT_PASSWORD = import.meta.env.VITE_ERP_PASSWORD ?? '';
const DEFAULT_SESSION = import.meta.env.VITE_DEFAULT_SESSION ?? '2026-27';

export default function App() {
  const [session, setSession] = useState(DEFAULT_SESSION);
  const [sessionInput, setSessionInput] = useState(DEFAULT_SESSION);
  const [dashboards, setDashboards] = useState<EntityDashboard[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'error'>('all');
  const tokenRef = useRef('');
  const entitiesRef = useRef<EntityConfig[]>([]);

  const loadData = async (tok: string, entities: EntityConfig[], sess: string) => {
    setStatus('loading');
    setDashboards(entities.map(entity => ({ entity, data: null, error: null, loading: true })));
    await fetchAllDashboards(tok, entities, sess, (entityId, data, error) => {
      setDashboards(prev => prev.map(d =>
        d.entity.id === entityId ? { ...d, data, error, loading: false } : d
      ));
    });
    setStatus('done');
  };

  useEffect(() => {
    (async () => {
      setStatus('loading');
      try {
        const resp = await login(DEFAULT_MOBILE, DEFAULT_PASSWORD);
        tokenRef.current = resp.token;
        const entities: EntityConfig[] = resp.entityGroup.map(e => ({
          id: e.entityId,
          name: e.displayName || e.name,
          session: DEFAULT_SESSION,
          logo: e.logo,
          type: e.entityType,
          qac: e.qac,
        }));
        entitiesRef.current = entities;
        await loadData(resp.token, entities, DEFAULT_SESSION);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : 'Failed to load data');
        setStatus('error');
      }
    })();
  }, []);

  const handleRefresh = () => {
    const newSession = sessionInput.trim() || DEFAULT_SESSION;
    setSession(newSession);
    loadData(tokenRef.current, entitiesRef.current, newSession);
  };

  const loaded = dashboards.filter(d => !d.loading);
  const successful = loaded.filter(d => d.data);
  const failed = loaded.filter(d => d.error);

  const totalStudents = successful.reduce((s, d) => s + (d.data!.headCount.currentSession[0]?.totalStudents ?? 0), 0);
  const totalActive = successful.reduce((s, d) => s + (d.data!.awakeDormantCount[0]?.awakeStudents ?? 0), 0);
  const totalNew = successful.reduce((s, d) => s + (d.data!.headCount.currentSession[0]?.newAdmission ?? 0), 0);
  const totalQueries = successful.reduce((s, d) => s + (d.data!.unresolvedODPayQueries ?? 0), 0);
  const totalInactive = successful.reduce((s, d) => s + (d.data!.headCount.currentSession[0]?.inactiveStudents ?? 0), 0);

  const searchLower = search.toLowerCase();
  const displayed = dashboards.filter(d => {
    if (filter === 'error' && !d.error) return false;
    if (search && !d.entity.name.toLowerCase().includes(searchLower) && !(d.entity as EntityConfig & { qac?: string }).qac?.toLowerCase().includes(searchLower)) return false;
    return true;
  });

  const loadingCount = dashboards.filter(d => d.loading).length;
  const progress = dashboards.length > 0 ? Math.round(((dashboards.length - loadingCount) / dashboards.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1e1b4b', color: '#fff', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', height: 58, gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22 }}>🏫</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>ERP Score Card</div>
            <div style={{ fontSize: 11, color: '#a5b4fc' }}>Student Overview Dashboard</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={sessionInput}
              onChange={e => setSessionInput(e.target.value)}
              placeholder="Session (e.g. 2025-26)"
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #4338ca', background: '#312e81', color: '#e0e7ff', fontSize: 13, width: 160 }}
            />
            <button onClick={handleRefresh} disabled={status === 'loading'} style={{ padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
              {status === 'loading' ? `Loading ${progress}%` : '🔄 Load'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
        {status === 'error' && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: 16, borderRadius: 10, marginBottom: 16 }}>
            ⚠ {errorMsg}
          </div>
        )}

        {/* Progress bar */}
        {status === 'loading' && dashboards.length > 0 && (
          <div style={{ background: '#e0e7ff', borderRadius: 8, height: 6, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#4f46e5', width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
        )}

        {/* Summary */}
        {successful.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Students', value: totalStudents.toLocaleString(), color: '#4f46e5', icon: '🎓' },
              { label: 'Active', value: totalActive.toLocaleString(), color: '#059669', icon: '✅' },
              { label: 'New Admissions', value: totalNew.toLocaleString(), color: '#0891b2', icon: '🆕' },
              { label: 'Inactive', value: totalInactive.toLocaleString(), color: '#dc2626', icon: '❌' },
              { label: 'Unresolved Queries', value: totalQueries.toLocaleString(), color: '#f59e0b', icon: '⚠' },
              { label: 'Entities', value: `${successful.length} / ${dashboards.length}`, color: '#7c3aed', icon: '🏢' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', borderTop: `4px solid ${s.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {dashboards.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entity..."
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, flex: 1, maxWidth: 300 }}
            />
            <button onClick={() => setFilter('all')} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: filter === 'all' ? '#4f46e5' : '#e5e7eb', color: filter === 'all' ? '#fff' : '#374151', fontSize: 13, cursor: 'pointer' }}>
              All ({dashboards.length})
            </button>
            {failed.length > 0 && (
              <button onClick={() => setFilter('error')} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: filter === 'error' ? '#dc2626' : '#fee2e2', color: filter === 'error' ? '#fff' : '#dc2626', fontSize: 13, cursor: 'pointer' }}>
                Errors ({failed.length})
              </button>
            )}
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              Session: <b>{session}</b>
            </span>
          </div>
        )}

        {/* Entity cards */}
        {displayed.map((ed, i) => (
          <EntityCard key={i} ed={ed} />
        ))}

        {displayed.length === 0 && status === 'done' && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 60 }}>No entities match your search.</div>
        )}
      </div>
    </div>
  );
}
