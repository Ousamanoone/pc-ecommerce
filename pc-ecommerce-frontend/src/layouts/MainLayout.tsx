import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomerChatWidget from '../components/CustomerChatWidget';
import { useTheme } from '../context/ThemeContext';
import { MessageCircle, Phone } from 'lucide-react';

const FacebookIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const YoutubeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const MainLayout: React.FC = () => {
  const { socialSettings } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>

      <Footer />

      {/* CỤM NÚT KẾT NỐI FANPAGE NỔI (Góc dưới bên trái) */}
      {socialSettings.showFloatingSocial && (
        <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2.5 print:hidden">
          {socialSettings.facebookUrl && (
            <a
              href={socialSettings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-sm sm:btn-md bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-none shadow-lg hover:scale-110 transition-transform"
              title="Facebook Fanpage"
            >
              <FacebookIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          )}

          {socialSettings.messengerUrl && (
            <a
              href={socialSettings.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-sm sm:btn-md bg-[#0084FF] hover:bg-[#0084FF]/90 text-white border-none shadow-lg hover:scale-110 transition-transform"
              title="Chat via Messenger"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          )}

          {socialSettings.zaloUrl && (
            <a
              href={socialSettings.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-sm sm:btn-md bg-[#0068FF] hover:bg-[#0068FF]/90 text-white border-none shadow-lg font-black text-[10px] sm:text-xs hover:scale-110 transition-transform"
              title="Chat Zalo"
            >
              Zalo
            </a>
          )}

          {socialSettings.youtubeUrl && (
            <a
              href={socialSettings.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-circle btn-sm sm:btn-md bg-[#FF0000] hover:bg-[#FF0000]/90 text-white border-none shadow-lg hover:scale-110 transition-transform"
              title="YouTube Channel"
            >
              <YoutubeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          )}

          {socialSettings.hotline && (
            <a
              href={`tel:${socialSettings.hotline}`}
              className="btn btn-circle btn-sm sm:btn-md btn-success text-white border-none shadow-lg hover:scale-110 transition-transform"
              title={`Hotline: ${socialSettings.hotline}`}
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          )}
        </div>
      )}

      <CustomerChatWidget />
    </div>
  );
};

export default MainLayout;