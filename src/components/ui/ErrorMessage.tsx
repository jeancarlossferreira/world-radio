import { AlertCircle } from 'lucide-react';

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="alert alert-error">
      <AlertCircle size={20} />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-error btn-sm">
          Retry
        </button>
      )}
    </div>
  );
}
