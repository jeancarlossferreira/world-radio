export function LoadingSpinner({ size = 32 }: { size?: number }) {
  const sizeClass = size >= 32 ? 'loading-lg' : size >= 24 ? 'loading-md' : 'loading-sm';
  return (
    <div className="flex justify-center py-8">
      <span className={`loading loading-spinner ${sizeClass} text-primary`} />
    </div>
  );
}
