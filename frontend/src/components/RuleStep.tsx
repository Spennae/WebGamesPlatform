import { NumberBadge } from './NumberBadge';

interface RuleStepProps {
  number: number;
  children: React.ReactNode;
}

export function RuleStep({ number, children }: RuleStepProps) {
  return (
    <div className="rules-step">
      <NumberBadge number={number} />
      <div className="rules-step-text">{children}</div>
    </div>
  );
}
