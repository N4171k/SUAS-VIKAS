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
          className="fixed bottom-6 right-6 z-50 bg-vikas-blue hover:bg-blue-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          aria-label="Open AI Chat Assistant"
        >
          <FiMessageCircle className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
