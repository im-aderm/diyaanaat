interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
}

export default function Badge({ variant = 'neutral', children }: BadgeProps) {
  const variants: Record<string, string> = {
    success: 'bg-tertiary-container text-on-tertiary-container',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-error-container text-on-error-container',
    info: 'bg-secondary-container text-on-secondary-container',
    neutral: 'bg-surface-container-high text-on-surface-variant',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
