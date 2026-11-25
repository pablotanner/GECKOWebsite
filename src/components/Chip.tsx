import { Icon } from './Icon';
import { verdicts, type Verdict } from '../lib/icons';

export function Chip({ verdict, size = 'md' }: { verdict: Verdict; size?: 'md' | 'lg' }) {
  const v = verdicts[verdict];
  return (
    <span className={`chip chip--${verdict}${size === 'lg' ? ' chip--lg' : ''}`}>
      <Icon name={v.icon} />
      <span>{v.label}</span>
    </span>
  );
}
