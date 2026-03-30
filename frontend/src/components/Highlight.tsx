interface HighlightProps {
  children: React.ReactNode;
  color?: string;
}

export function Highlight({ children, color = 'var(--text-primary)' }: HighlightProps) {
  return <span style={{ color }}>{children}</span>;
}
