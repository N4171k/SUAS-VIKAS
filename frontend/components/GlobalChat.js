'use client';
import { useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import ChatBubble from './ChatBubble';

export default function GlobalChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatBubble onClose={() => setOpen(false)} />}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          id="vikas-chat-btn"
          className="fixed bottom-6 right-6 z-50 bg-gray-900 hover:bg-gray-800 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-white/10 hover:-translate-y-1"
          aria-label="Open AI Chat Assistant"
        >
          <FiMessageCircle className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
