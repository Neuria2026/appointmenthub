import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  overlay?: boolean;
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

export function LoadingSpinner({
  size = 'md',
  overlay = false,
  label,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={clsx(
          'rounded-full border-primary-200 border-t-primary-500 animate-spin',
          sizeClasses[size]
        )}
        style={{ borderStyle: 'solid' }}
        role="status"
        aria-label={label || 'Cargando...'}
      />
      {label && <p className="text-sm text-gray-500 animate-pulse">{label}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label="Cargando..." />
    </div>
  );
}

export function InlineLoader({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
      <LoadingSpinner size="sm" />
      <span>{text}</span>
    </div>
  );
}
