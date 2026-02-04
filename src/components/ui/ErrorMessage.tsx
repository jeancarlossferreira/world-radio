import { AlertCircle } from 'lucide-react';
import styles from './ErrorMessage.module.css';

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.error}>
      <AlertCircle size={20} />
      <span>{message}</span>
      {onRetry && <button onClick={onRetry} className={styles.retry}>Retry</button>}
    </div>
  );
}
