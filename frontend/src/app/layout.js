import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GlobalChat from '../../components/GlobalChat';
import { AuthProvider } from '../../lib/authContext';

export const metadata = {
  title: 'VIKAS – Where Fashion Meets Intelligence',
  description: 'AI-powered omnichannel marketplace for smart shopping with AR try-on, reservations, and real-time inventory.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Ensure content fits within safe areas on all devices/notches */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600;1,700&family=IBM+Plex+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F7F7F7]">
        <AuthProvider>
          <Toaster position="top-right" />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <GlobalChat />
        </AuthProvider>
      </body>
    </html>
  );
}
