'use client';

/**
 * Loader – versatile loading indicator used across VIKAS.
 *
 * Props:
 *   fullScreen  {boolean} – covers the whole viewport (default false)
 *   overlay     {boolean} – semi-transparent dark backdrop behind the spinner
 *   size        {'sm'|'md'|'lg'} – spinner size  (default 'md')
 *   label       {string}  – optional text shown below the spinner
 *   className   {string}  – extra classes on the wrapper
 */
export default function Loader({
  fullScreen = false,
  overlay = false,
  size = 'md',
  label = '',
  className = '',
}) {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      {/* Outer orbit ring */}
      <div className={`relative ${sizeMap[size]}`} aria-hidden>
        {/* track */}
        <div className={`absolute inset-0 rounded-full border-gray-200 ${sizeMap[size]}`} />
        {/* spinning arc */}
        <div
          className={`absolute inset-0 rounded-full border-t-transparent border-l-transparent border-airbnb-red vikas-spin ${sizeMap[size]}`}
          style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
        />
      </div>
      {/* Label */}
      {label && (
        <p className="text-sm font-medium text-gray-400 tracking-wide animate-pulse select-none">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-[300] flex items-center justify-center
          ${overlay ? 'bg-white/80 backdrop-blur-sm' : 'bg-[#F7F7F7]'}
          ${className}`}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Brand mark */}
          <span className="text-2xl font-extrabold tracking-tighter text-gray-900 select-none mb-1">
            <span className="text-airbnb-red">●</span> VIKAS
          </span>
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      {spinner}
    </div>
  );
}
