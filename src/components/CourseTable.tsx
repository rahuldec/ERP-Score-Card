import type { CourseEntry } from '../types';

interface Props {
  courses: CourseEntry[];
}

export default function CourseTable({ courses }: Props) {
  const sorted = [...courses].sort((a, b) => b.total - a.total);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {['Course', 'Total', 'New Admission', 'Active', 'Dormant'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#374151', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 14px', fontWeight: 500, color: '#111827' }}>{c.course}</td>
              <td style={{ padding: '10px 14px', color: '#374151' }}>{c.total}</td>
              <td style={{ padding: '10px 14px', color: '#059669' }}>{c.newAdmission}</td>
              <td style={{ padding: '10px 14px', color: '#2563eb' }}>{c.awakeStudents}</td>
              <td style={{ padding: '10px 14px', color: '#dc2626' }}>{c.dormantStudents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
