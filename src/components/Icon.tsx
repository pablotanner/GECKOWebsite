import { icons, type IconName } from '../lib/icons';

export function Icon({ name, size = 'md', className = '' }: { name: IconName; size?: 'sm' | 'md'; className?: string }) {
  return (
    <svg
      className={`icon${size === 'sm' ? ' icon--sm' : ''}${className ? ' ' + className : ''}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}
