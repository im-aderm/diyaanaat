interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-outline-variant">
          <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
