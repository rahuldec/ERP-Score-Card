import type { EntityDashboard } from '../types';
import StatCard from './StatCard';
import CourseTable from './CourseTable';

interface Props {
  ed: EntityDashboard;
}

export default function EntityCard({ ed }: Props) {
  const { entity, data, error, loading } = ed;

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          {entity.logo && <img src={entity.logo} alt="" style={{ height: 40, borderRadius: 6 }} />}
          <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{entity.name}</h2>
        </div>
        <div style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          {entity.logo && <img src={entity.logo} alt="" style={{ height: 40, borderRadius: 6 }} />}
          <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{entity.name}</h2>
        </div>
        <div style={{ color: '#dc2626', background: '#fef2f2', padding: 16, borderRadius: 8, fontSize: 13 }}>
          ⚠ {error || 'No data available'}
        </div>
      </div>
    );
  }

  const hc = data.headCount.currentSession[0];
  const aw = data.awakeDormantCount[0];

  const activeStudents = aw?.awakeStudents ?? 0;
  const dormantStudents = aw?.dormantStudents ?? 0;
  const activePct = hc.totalStudents > 0 ? Math.round((activeStudents / hc.totalStudents) * 100) : 0;

  const totalInactive = hc.inactiveStudents;

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {entity.logo && <img src={entity.logo} alt="" style={{ height: 40, borderRadius: 6, objectFit: 'contain' }} />}
        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{entity.name}</h2>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            {entity.qac && <span style={{ fontSize: 11, color: '#6b7280' }}>{entity.qac}</span>}
            {entity.type && <span style={{ fontSize: 11, background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: 10 }}>{entity.type}</span>}
          </div>
        </div>
        {data.unresolvedODPayQueries > 0 && (
          <span style={{
            marginLeft: 'auto',
            background: '#fef3c7',
            color: '#92400e',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
          }}>
            {data.unresolvedODPayQueries} unresolved queries
          </span>
        )}
      </div>

      {/* Primary stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <StatCard label="Total Students" value={hc.totalStudents} icon="🎓" color="#4f46e5" />
        <StatCard label="Active" value={activeStudents} sub={`${activePct}% of total`} icon="✅" color="#059669" />
        <StatCard label="Dormant" value={dormantStudents} icon="😴" color="#f59e0b" />
        <StatCard label="New Admissions" value={hc.newAdmission} icon="🆕" color="#0891b2" />
        <StatCard label="Inactive" value={totalInactive} icon="❌" color="#dc2626" />
        <StatCard label="App Users" value={hc.appStudents} icon="📱" color="#7c3aed" />
      </div>

      {/* Gender split */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard label="Boys" value={hc.boys} color="#2563eb" icon="👦" />
        <StatCard label="Girls" value={hc.girls} color="#db2777" icon="👧" />
        {hc.others > 0 && <StatCard label="Others" value={hc.others} color="#6b7280" />}
        {aw && <StatCard label="Today's Activations" value={aw.todayActivations} color="#10b981" icon="⚡" />}
      </div>

      {/* Course breakdown */}
      {data.groupByCourse.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 10px', fontSize: 14, color: '#374151', fontWeight: 600 }}>Course-wise Breakdown</h3>
          <CourseTable courses={data.groupByCourse} />
        </div>
      )}

      {/* Birthday students */}
      {data.birthDayStudents.length > 0 && (
        <div style={{ marginTop: 16, background: '#fef9c3', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>🎂 Today's Birthdays</div>
          {data.birthDayStudents.map(s => (
            <div key={s._id} style={{ fontSize: 13, color: '#78350f' }}>
              {s.name} — {s.course} {s.section && `(${s.section})`}
            </div>
          ))}
        </div>
      )}

      {/* Inactive reasons */}
      {data.inactiveReason.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 13, color: '#374151', fontWeight: 600 }}>Inactive Reasons</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {data.inactiveReason.map((r, i) => (
              <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
                {r.remark}: {r.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  marginBottom: 24,
};
