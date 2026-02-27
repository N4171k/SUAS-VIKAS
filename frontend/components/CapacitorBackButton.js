'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Registers a Capacitor App back-button listener on Android so that the
 * hardware back button navigates within the Next.js SPA instead of closing
 * the app.  Falls back gracefully on the web (listener is silently ignored).
 */
export default function CapacitorBackButton() {
  const router = useRouter();

  useEffect(() => {
    let cleanup = () => {};

    // Capacitor is only available inside the native WebView
    if (typeof window === 'undefined') return;

    import('@capacitor/app').then(({ App }) => {
      const handler = App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          router.back();
        } else {
          // Nothing to go back to – send user to home rather than killing the app
          router.push('/');
        }
      });

      cleanup = () => {
        handler.then((h) => h.remove()).catch(() => {});
      };
    }).catch(() => {
      // Not running inside Capacitor – ignore
    });

    return () => cleanup();
  }, [router]);

  return null;
}
