// Kiosk has its own isolated layout — no shared header/footer
export const metadata = {
  title: 'VIKAS Kiosk · In-Store Shopping',
  description: 'VIKAS in-store self-service kiosk',
};

export default function KioskLayout({ children }) {
  return (
    <div className="kiosk-root">
      {children}
    </div>
  );
}
