interface Props {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
  icon?: string;
}

export default function StatCard({ label, value, sub, color = '#4f46e5', icon }: Props) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      borderTop: `4px solid ${color}`,
      minWidth: 140,
      flex: 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
      </div>
    </div>
  );
}
