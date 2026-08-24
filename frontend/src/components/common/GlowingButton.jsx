export default function GlowingButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  innerClassName = '',
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-xs sm:text-sm',
    lg: 'px-8 py-3.5 text-sm sm:text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glow-btn ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="glow-blob" />
      <div className={`glow-inner ${sizeClasses[size] || sizeClasses.md} ${innerClassName}`}>
        {children}
      </div>
    </button>
  );
}
