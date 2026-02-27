'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PageTransitionLoader
 * Renders a slim animated progress bar at the very top of the screen
 * whenever the Next.js route changes (static export / client navigation).
 */
export default function PageTransitionLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Pathname just changed — start the bar
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      setProgress(0);
      setVisible(true);

      // Quickly advance to ~90 % then complete after a short delay
      let p = 0;
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        p += Math.random() * 18 + 8;
        if (p >= 90) {
          p = 90;
          clearInterval(timerRef.current);
        }
        setProgress(p);
      }, 100);

      // Complete + hide
      const done = setTimeout(() => {
        clearInterval(timerRef.current);
        setProgress(100);
        setTimeout(() => setVisible(false), 350);
      }, 600);

      return () => {
        clearInterval(timerRef.current);
        clearTimeout(done);
      };
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      aria-hidden
    >
      <div
        className="h-full bg-gradient-to-r from-airbnb-red via-rose-400 to-airbnb-red vikas-progress-bar"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.15s linear',
          boxShadow: '0 0 8px rgba(255,56,92,0.7)',
        }}
      />
    </div>
  );
}
