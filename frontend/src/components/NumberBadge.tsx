interface NumberBadgeProps {
  number: number;
  color?: string;
  backgroundColor?: string;
}

export function NumberBadge({ number, color = 'var(--accent-green)', backgroundColor = 'rgba(166, 227, 161, 0.2)' }: NumberBadgeProps) {
  return (
    <div
      className="number-badge"
      style={{
        background: backgroundColor,
        color,
      }}
    >
      {number}
    </div>
  );
}
