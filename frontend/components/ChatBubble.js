'use client';
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageCircle } from 'react-icons/fi';
import api from '../lib/api';
import { useAuth } from '../lib/authContext';

export default function ChatBubble({ productId = null, onClose }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: productId
      ? 'Hi! I can answer your questions about this product. What would you like to know?'
      : 'Hi! I\'m VIKAS AI, your fashion shopping assistant. How can I help you today? I can help you find clothes, shoes, compare options, or check store availability.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const chatRef = useRef(null);
  const productContextRef = useRef(null);

  // Load Puter.js SDK via script tag
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.onload = () => setPuterReady(true);
      document.head.appendChild(script);
    } else if (window.puter) {
      setPuterReady(true);
    }
  }, []);

  // Pre-fetch product context for product-specific chat
  useEffect(() => {
    if (productId) {
      api.post(`/ai/product/${productId}/ask`, { question: '' })
        .then((res) => { productContextRef.current = res.data; })
        .catch(() => {});
    }
  }, [productId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      let contextStr = '';
      let systemPrompt = '';
      let foundProducts = [];

      if (productId && productContextRef.current) {
        // Product-specific: use pre-fetched context
        contextStr = productContextRef.current.context;
        systemPrompt = productContextRef.current.systemPrompt;
      } else {
        // General query: fetch product context from backend RAG
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.post('/ai/query', { message: userMessage }, { headers });
        contextStr = res.data.context;
        systemPrompt = res.data.systemPrompt;
        foundProducts = res.data.products || [];
      }

      // Build messages for Puter.js AI
      const aiMessages = [];

      // System prompt
      if (systemPrompt) {
        aiMessages.push({ role: 'system', content: systemPrompt });
      } else {
        aiMessages.push({
          role: 'system',
          content: 'You are VIKAS (Virtually Intelligent Knowledge Assisted Shopping), an AI fashion shopping assistant. Be friendly, concise, and helpful. Format prices in Indian Rupees (₹).',
        });
      }

      // Product context
      if (contextStr) {
        aiMessages.push({
          role: 'system',
          content: `Here are relevant products from our fashion catalog:\n\n${contextStr}`,
        });
      }

      // Conversation history (last 10 messages)
      const history = messages.slice(-10);
      for (const msg of history) {
        aiMessages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
      }

      // Current user message
      aiMessages.push({ role: 'user', content: userMessage });

      // Call Puter.js AI
      let aiResponse = '';
      if (puterReady && window.puter) {
        const result = await window.puter.ai.chat(aiMessages);
        aiResponse = typeof result === 'string' ? result : (result?.message?.content || result?.toString() || 'Sorry, I could not generate a response.');
      } else {
        aiResponse = 'AI is loading, please try again in a moment...';
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponse },
      ]);

      // Show related products if found
      if (foundProducts.length > 0) {
        const productList = foundProducts
          .map((p) => `[\u{1F6CD}\uFE0F ${p.title}](/product/${p.id}) — \u20B9${parseFloat(p.price).toLocaleString()} (\u2B50${p.rating}) | ${p.colour || ''} | ${p.usage || ''}`)
          .join('\n');
        setMessages((prev) => [
          ...prev,
          { role: 'products', content: productList, products: foundProducts },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I\'m having trouble right now. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
      style={{ height: '500px', maxHeight: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div className="bg-vikas-blue text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <FiMessageCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold text-sm">VIKAS AI Assistant</p>
            <p className="text-xs text-blue-200">Powered by Puter.js AI</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'products' && msg.products ? (
              <div className="max-w-[90%] space-y-2">
                <p className="text-xs font-semibold text-gray-500 px-1">{'\uD83D\uDCE6'} Matching Products:</p>
                {msg.products.map((p) => (
                  <a key={p.id} href={`/product/${p.id}`}
                    className="block bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-xl px-3 py-2 transition group">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <img src={p.image_url} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-vikas-blue">{p.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="font-semibold text-vikas-blue">{'\u20B9'}{parseFloat(p.price).toLocaleString()}</span>
                          <span>{'\u2B50'}{p.rating}</span>
                          {p.colour && <span>{p.colour}</span>}
                          {p.usage && <span>• {p.usage}</span>}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-vikas-blue text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-100 p-3 flex gap-2 flex-shrink-0">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about fashion..." disabled={loading}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-vikas-blue disabled:opacity-50" />
        <button type="submit" disabled={loading || !input.trim()}
          className="bg-vikas-blue text-white p-2.5 rounded-full hover:bg-blue-800 transition disabled:opacity-50">
          <FiSend className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
