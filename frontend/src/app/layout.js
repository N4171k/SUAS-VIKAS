import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GlobalChat from '../../components/GlobalChat';
import { AuthProvider } from '../../lib/authContext';

export const metadata = {
  title: 'VIKAS – Virtually Intelligent Knowledge Assisted Shopping',
  description: 'AI-powered omnichannel marketplace for smart shopping with AR try-on, reservations, and real-time inventory.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
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
