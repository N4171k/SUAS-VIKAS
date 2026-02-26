'use client';
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';
import api from '../lib/api';
import { useAuth } from '../lib/authContext';

// ─── Shared Product Card ──────────────────────────────────────────────────────
function ProductCard({ product: p }) {
  return (
    <a
      href={`/product/${p.id}`}
      className="block rounded-2xl px-3 py-2.5 transition-all group"
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0EDE8',
        boxShadow: '0 2px 8px rgba(34,34,34,0.06)',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#FF385C';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,56,92,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#F0EDE8';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(34,34,34,0.06)';
      }}
    >
      <div className="flex items-center gap-3">
        {p.image_url && (
          <img
            src={p.image_url}
            alt={p.title}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            style={{ border: '1px solid #F0EDE8' }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: '#222222' }}>
            {p.title}
          </p>
          <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap" style={{ color: '#717171' }}>
            {p.price && (
              <span className="font-bold" style={{ color: '#FF385C' }}>
                ₹{parseFloat(p.price).toLocaleString()}
              </span>
            )}
            {p.rating && <span style={{ color: '#CC5833' }}>⭐ {p.rating}</span>}
            {p.colour && <span>{p.colour}</span>}
            {p.usage && <span>• {p.usage}</span>}
          </div>
        </div>
        <svg
          className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: '#FF385C' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────
// Renders assistant markdown as React elements.
// Supported: headings (h1–h3), **bold**, *italic*, `code`, code blocks,
//            unordered & ordered lists, blockquotes, hr, markdown links,
//            product links [text](/product/ID), and Name [ID:digits] refs.
// Product refs are rendered as ProductCard when productMap contains that ID.

function MarkdownMessage({ text, productMap = {} }) {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  // ── inline parser ──
  const parseInline = (str, keyPrefix) => {
    // First pass: detect product refs in two formats:
    //   Name [ID:2492]        — bracket style
    //   Name (ID: 2492)       — parenthesis style (AI natural output)
    const productRefRe = /\b([^\n\[\](]{1,80}?)\s*(?:\[ID:(\d+)\]|\(ID:\s*(\d+)\))/g;
    const segments = [];
    let lastIdx = 0;
    let pm;
    while ((pm = productRefRe.exec(str)) !== null) {
      const id = pm[2] || pm[3]; // bracket group or paren group
      if (pm.index > lastIdx) segments.push({ type: 'text', value: str.slice(lastIdx, pm.index) });
      segments.push({ type: 'product-ref', name: pm[1].trim(), id });
      lastIdx = pm.index + pm[0].length;
    }
    if (lastIdx < str.length) segments.push({ type: 'text', value: str.slice(lastIdx) });

    // If no product refs found, skip the extra step
    const hasRefs = segments.some(s => s.type === 'product-ref');
    const sourceSegs = hasRefs ? segments : [{ type: 'text', value: str }];

    return sourceSegs.map((seg, si) => {
      if (seg.type === 'product-ref') {
        const p = productMap[seg.id];
        if (p) return <div key={`${keyPrefix}-pref-${si}`} className="my-2"><ProductCard product={p} /></div>;
        return (
          <Link key={`${keyPrefix}-pref-${si}`} href={`/product/${seg.id}`}
            className="font-semibold underline underline-offset-2"
            style={{ color: '#FF385C' }}>
            {seg.name}
          </Link>
        );
      }

      // Second pass: bold, italic, code, links
      const inlineRe = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\((\/product\/\d+|https?:\/\/[^\)]+)\))/g;
      const parts = [];
      let last = 0;
      let m;
      let k = 0;
      while ((m = inlineRe.exec(seg.value)) !== null) {
        if (m.index > last) parts.push(<span key={`${keyPrefix}-${si}-t${k++}`}>{seg.value.slice(last, m.index)}</span>);
        if (m[2]) { // **bold**
          parts.push(<strong key={`${keyPrefix}-${si}-b${k++}`} style={{ color: '#222222', fontWeight: 700 }}>{m[2]}</strong>);
        } else if (m[3]) { // *italic*
          parts.push(<em key={`${keyPrefix}-${si}-i${k++}`}>{m[3]}</em>);
        } else if (m[4]) { // `code`
          parts.push(
            <code key={`${keyPrefix}-${si}-c${k++}`} style={{
              background: '#F2F0E9', padding: '1px 5px', borderRadius: '4px',
              fontSize: '0.8em', fontFamily: 'monospace', color: '#CC5833',
            }}>{m[4]}</code>
          );
        } else if (m[5] && m[6]) { // [text](url)
          const isProduct = m[6].startsWith('/product/');
          parts.push(
            <Link key={`${keyPrefix}-${si}-l${k++}`} href={m[6]}
              {...(!isProduct ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="underline underline-offset-2 font-semibold"
              style={{ color: isProduct ? '#FF385C' : '#004E89' }}>
              {m[5]}
            </Link>
          );
        }
        last = m.index + m[0].length;
      }
      if (last < seg.value.length) parts.push(<span key={`${keyPrefix}-${si}-tail`}>{seg.value.slice(last)}</span>);
      return <span key={`${keyPrefix}-seg-${si}`}>{parts}</span>;
    });
  };

  // ── block parser ──
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      i++;
      blocks.push(
        <pre key={`code-${i}`} style={{
          background: '#1e293b', color: '#e2e8f0', borderRadius: '10px',
          padding: '10px 14px', fontSize: '0.75em', overflowX: 'auto',
          margin: '6px 0', lineHeight: 1.6,
        }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(<hr key={`hr-${i++}`} style={{ border: 'none', borderTop: '1px solid #F0EDE8', margin: '8px 0' }} />);
      continue;
    }

    // Heading
    const hm = line.match(/^(#{1,3})\s+(.+)/);
    if (hm) {
      const level = hm[1].length;
      const sizes = ['1em', '0.95em', '0.9em'];
      blocks.push(
        <p key={`h-${i++}`} style={{
          fontWeight: 700, fontSize: sizes[level - 1] || '0.875em',
          color: '#222222', margin: '6px 0 2px',
          borderBottom: level === 1 ? '1px solid #F0EDE8' : 'none',
          paddingBottom: level === 1 ? '4px' : 0,
        }}>
          {parseInline(hm[2], `h-${i}`)}
        </p>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const qLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) { qLines.push(lines[i].slice(2)); i++; }
      blocks.push(
        <div key={`bq-${i}`} style={{
          borderLeft: '3px solid #FF385C', paddingLeft: '10px',
          margin: '4px 0', color: '#717171', fontStyle: 'italic', fontSize: '0.875em',
        }}>
          {qLines.map((ql, qi) => <p key={qi} style={{ margin: '2px 0' }}>{parseInline(ql, `bq-${i}-${qi}`)}</p>)}
        </div>
      );
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) { items.push(lines[i].replace(/^[-*+]\s/, '')); i++; }
      blocks.push(
        <ul key={`ul-${i}`} style={{ margin: '4px 0', padding: 0, listStyle: 'none' }}>
          {items.map((item, ii) => (
            <li key={ii} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', margin: '2px 0', fontSize: '0.875em', lineHeight: 1.6 }}>
              <span style={{ color: '#FF385C', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>•</span>
              <span>{parseInline(item, `ul-${i}-${ii}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      const startNum = parseInt(line.match(/^(\d+)\./)[1], 10);
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, '')); i++; }
      blocks.push(
        <ol key={`ol-${i}`} style={{ margin: '4px 0', padding: 0, listStyle: 'none' }}>
          {items.map((item, ii) => (
            <li key={ii} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '2px 0', fontSize: '0.875em', lineHeight: 1.6 }}>
              <span style={{ color: '#FF385C', fontWeight: 700, minWidth: '18px', flexShrink: 0 }}>{startNum + ii}.</span>
              <span>{parseInline(item, `ol-${i}-${ii}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph
    blocks.push(
      <p key={`p-${i++}`} style={{ margin: '2px 0', fontSize: '0.875em', lineHeight: 1.65, color: '#222222' }}>
        {parseInline(line, `p-${i}`)}
      </p>
    );
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{blocks}</div>;
}

// ─── ChatBubble ───────────────────────────────────────────────────────────────
export default function ChatBubble({ productId = null, onClose }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: productId
        ? "Hi! I can answer your questions about this product. What would you like to know?"
        : "Hi! I'm **VIKAS AI**, your fashion shopping assistant.\n\nI can help you:\n- Find clothes & shoes\n- Compare options\n- Check store availability",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [productMap, setProductMap] = useState({});
  const chatRef = useRef(null);
  const productContextRef = useRef(null);

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

  useEffect(() => {
    if (productId) {
      api.post(`/ai/product/${productId}/ask`, { question: '' })
        .then(res => { productContextRef.current = res.data; })
        .catch(() => {});
    }
  }, [productId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      let contextStr = '';
      let systemPrompt = '';
      let foundProducts = [];

      if (productId && productContextRef.current) {
        contextStr = productContextRef.current.context;
        systemPrompt = productContextRef.current.systemPrompt;
      } else {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.post('/ai/query', { message: userMessage }, { headers });
        contextStr = res.data.context;
        systemPrompt = res.data.systemPrompt;
        foundProducts = res.data.products || [];
      }

      if (foundProducts.length > 0) {
        setProductMap(prev => {
          const updated = { ...prev };
          foundProducts.forEach(p => { updated[String(p.id)] = p; });
          return updated;
        });
      }

      const aiMessages = [];
      aiMessages.push({
        role: 'system',
        content: systemPrompt ||
          'You are VIKAS (Virtually Intelligent Knowledge Assisted Shopping), an AI fashion shopping assistant. ' +
          'Be friendly, concise, and helpful. Format prices in Indian Rupees (₹). ' +
          'Use markdown in responses: **bold** for product names and important info, bullet points for lists, headings for sections.',
      });
      if (contextStr) {
        aiMessages.push({ role: 'system', content: `Here are relevant products from our fashion catalog:\n\n${contextStr}` });
      }
      messages.slice(-10).forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          aiMessages.push({ role: msg.role, content: msg.content });
        }
      });
      aiMessages.push({ role: 'user', content: userMessage });

      let aiResponse = 'AI is loading, please try again in a moment...';
      if (puterReady && window.puter) {
        const result = await window.puter.ai.chat(aiMessages);
        aiResponse = typeof result === 'string'
          ? result
          : (result?.message?.content || result?.toString() || 'Sorry, I could not generate a response.');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

      if (foundProducts.length > 0) {
        setMessages(prev => [...prev, { role: 'products', products: foundProducts }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-20 right-6 flex flex-col z-50 overflow-hidden"
      style={{
        width: '384px',
        maxWidth: 'calc(100vw - 2rem)',
        height: '580px',
        maxHeight: 'calc(100vh - 160px)',
        borderRadius: '24px',
        background: '#FFFFFF',
        border: '1px solid #F0EDE8',
        boxShadow: '0 32px 80px rgba(34,34,34,0.14), 0 8px 24px rgba(255,56,92,0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderBottom: '2px solid #FF385C',
          flexShrink: 0,
        }}
        className="px-4 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div style={{
            background: 'linear-gradient(135deg, #FF385C, #E61E4D)',
            borderRadius: '10px', padding: '6px',
            boxShadow: '0 2px 8px rgba(255,56,92,0.4)',
          }}>
            <FiMessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-white tracking-wide">VIKAS AI</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Your fashion assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="block w-1.5 h-1.5 rounded-full" style={{
              background: '#00A878',
              boxShadow: '0 0 0 3px rgba(0,168,120,0.25)',
              animation: 'vikas-pulse 2s infinite',
            }} />
            <span className="text-xs" style={{ color: '#00A878' }}>Live</span>
          </div>
          <button
            onClick={onClose}
            className="transition-colors rounded-lg p-1"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 pt-3 pb-3 space-y-3"
        style={{ background: '#F7F7F7' }}
      >
        {messages.map((msg, i) => {
          /* ── Product list ── */
          if (msg.role === 'products' && msg.products?.length > 0) {
            return (
              <div key={i} className="flex justify-start">
                <div className="w-full space-y-2">
                  <p className="text-xs font-semibold px-1 flex items-center gap-1" style={{ color: '#717171' }}>
                    <span>📦</span> Matching Products
                  </p>
                  {msg.products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            );
          }

          /* ── User bubble ── */
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div
                  className="max-w-[82%] px-4 py-2.5 text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#FFFFFF',
                    borderRadius: '18px 18px 4px 18px',
                    boxShadow: '0 2px 12px rgba(15,23,42,0.2)',
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          /* ── Assistant bubble (markdown) ── */
          return (
            <div key={i} className="flex justify-start">
              <div
                className="max-w-[92%] px-4 py-3"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px 18px 18px 4px',
                  border: '1px solid #F0EDE8',
                  boxShadow: '0 2px 8px rgba(34,34,34,0.06)',
                }}
              >
                <MarkdownMessage text={msg.content} productMap={productMap} />
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 flex items-center gap-1"
              style={{
                background: '#FFFFFF',
                border: '1px solid #F0EDE8',
                borderRadius: '18px 18px 18px 4px',
                boxShadow: '0 2px 8px rgba(34,34,34,0.06)',
              }}
            >
              {[0, 150, 300].map((delay, idx) => (
                <div
                  key={idx}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: '#FF385C', animationDelay: `${delay}ms`, opacity: 0.7 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex gap-2 p-3 flex-shrink-0"
        style={{ borderTop: '1px solid #F0EDE8', background: '#FFFFFF' }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything about fashion…"
          disabled={loading}
          className="flex-1 text-sm outline-none disabled:opacity-50"
          style={{
            padding: '10px 16px',
            borderRadius: '50px',
            border: '1.5px solid #F0EDE8',
            background: '#F7F7F7',
            color: '#222222',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#FF385C';
            e.target.style.boxShadow = '0 0 0 3px rgba(255,56,92,0.1)';
            e.target.style.background = '#FFFFFF';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#F0EDE8';
            e.target.style.boxShadow = 'none';
            e.target.style.background = '#F7F7F7';
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex-shrink-0 transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #FF385C, #E61E4D)',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '42px', height: '42px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,56,92,0.35)',
            border: 'none', cursor: 'pointer',
          }}
          onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>

      <style jsx>{`
        @keyframes vikas-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}