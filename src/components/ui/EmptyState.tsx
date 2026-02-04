import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-base-content/40 mb-3">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-base-content/60 mt-1">{description}</p>}
    </div>
  );
}
