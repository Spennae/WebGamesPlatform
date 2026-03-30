interface RulesCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function RulesCard({ title, description, children }: RulesCardProps) {
  return (
    <div className="rules-card">
      <div className="rules-card-inner">
        <div className="rules-title">{title}</div>
        <div className="rules-description">{description}</div>
        {children}
      </div>
    </div>
  );
}
