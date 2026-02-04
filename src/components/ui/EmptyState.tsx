import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
