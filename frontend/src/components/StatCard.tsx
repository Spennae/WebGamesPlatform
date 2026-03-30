interface StatCardProps {
  value: number | string;
  label: string;
  unit?: string;
  color?: string;
}

export function StatCard({ value, label, unit, color = 'var(--text-primary)' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {unit && <div className="stat-label">{unit}</div>}
    </div>
  );
}
