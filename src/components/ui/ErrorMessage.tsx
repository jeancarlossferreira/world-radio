import { AlertCircle } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n();

  return (
    <div role="alert" className="alert alert-error">
      <AlertCircle size={20} />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-error btn-sm">
          {t('action.retry')}
        </button>
      )}
    </div>
  );
}
