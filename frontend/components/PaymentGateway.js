'use client';
import { useState, useEffect, useRef } from 'react';
import {
  FiX, FiCreditCard, FiSmartphone, FiMonitor, FiCheck, FiAlertCircle,
  FiRefreshCw, FiLock, FiShield, FiChevronRight,
} from 'react-icons/fi';
import api from '../lib/api';

// ── Bank list for net banking ─────────────────────────────────────────────
const BANKS = [
  { id: 'sbi',    name: 'SBI',         logo: '🏦' },
  { id: 'hdfc',   name: 'HDFC',        logo: '🏛' },
  { id: 'icici',  name: 'ICICI',       logo: '🔵' },
  { id: 'axis',   name: 'Axis',        logo: '🔴' },
  { id: 'kotak',  name: 'Kotak',       logo: '🟠' },
  { id: 'pnb',    name: 'PNB',         logo: '🟣' },
  { id: 'bob',    name: 'Bank of Baroda', logo: '🟡' },
  { id: 'canara', name: 'Canara',      logo: '🟢' },
];

// ── Card type detection ────────────────────────────────────────────────────
function detectCardType(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n))             return 'Visa';
  if (/^5[1-5]/.test(n))       return 'Mastercard';
  if (/^3[47]/.test(n))        return 'Amex';
  if (/^6(011|5)/.test(n))     return 'Discover';
  if (/^35(2[89]|[3-8])/.test(n)) return 'JCB';
  if (/^(6304|6759|676[1-3])/.test(n)) return 'Maestro';
  return null;
}

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  return clean.length > 2 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean;
}

// ── QR Code component (text-art simulation) ───────────────────────────────
function QRDisplay({ amount, sessionId }) {
  const [timer, setTimer] = useState(300); // 5 min
  useEffect(() => {
    const t = setInterval(() => setTimer((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(timer / 60)).padStart(2, '0');
  const ss = String(timer % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Simulated QR visual */}
      <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-inner">
        <div className="w-44 h-44 grid grid-cols-11 gap-px">
          {Array.from({ length: 121 }).map((_, i) => {
            // Deterministic pattern from sessionId hash
            const seed = (sessionId.charCodeAt(i % sessionId.length) + i * 7) % 17;
            const on = seed < 9 || (i < 22) || (i > 98) || (i % 11 === 0) || (i % 11 === 10);
            return <div key={i} className={`rounded-[1px] ${on ? 'bg-gray-900' : 'bg-white'}`} />;
          })}
        </div>
        {/* Corner markers */}
        <div className="absolute top-3 left-3 w-8 h-8 border-4 border-gray-900 rounded-sm" />
        <div className="absolute top-3 right-3 w-8 h-8 border-4 border-gray-900 rounded-sm" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-4 border-gray-900 rounded-sm" />
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">₹{parseFloat(amount).toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-0.5">Scan with any UPI app</p>
        <div className={`mt-2 text-sm font-semibold ${timer < 60 ? 'text-red-500' : 'text-airbnb-red'}`}>
          Expires in {mm}:{ss}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
          <span key={app} className="px-2 py-1 bg-gray-100 rounded-full">{app}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main PaymentGateway component ─────────────────────────────────────────
/**
 * Props:
 *  amount       — number (required)
 *  description  — string
 *  orderId      — string/number
 *  source       — 'web' | 'kiosk'
 *  onSuccess    — fn({ transactionId, method, amount })
 *  onClose      — fn()
 *  forceMethod  — 'cash' (kiosk only, skips method selection)
 */
export default function PaymentGateway({ amount, description, orderId, source = 'web', onSuccess, onClose, forceMethod }) {
  const [sessionId, setSessionId] = useState(null);
  const [method, setMethod] = useState(forceMethod || 'card');
  const [step, setStep] = useState('init'); // init | pay | processing | success | failed

  // Card fields
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardFlipped, setCardFlipped] = useState(false);
  const cardType = detectCardType(card.number);

  // UPI
  const [upiId, setUpiId] = useState('');

  // Net banking
  const [bank, setBank] = useState(null);

  // Results
  const [txn, setTxn]             = useState(null);
  const [errorMsg, setErrorMsg]   = useState('');

  // ── Initiate session on mount ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.post('/payment/initiate', { amount, description, orderId, source });
        setSessionId(res.data.sessionId);
        setStep('pay');
        if (forceMethod) setMethod(forceMethod);
      } catch (e) {
        setErrorMsg('Could not start payment session.');
        setStep('failed');
      }
    })();
  }, []);

  // ── Process payment ───────────────────────────────────────────────────
  const pay = async () => {
    if (!sessionId) return;
    setStep('processing');
    setErrorMsg('');

    const payload = method === 'card'       ? { cardNumber: card.number, expiry: card.expiry }
                  : method === 'upi'        ? { upiId }
                  : method === 'netbanking' ? { bank }
                  : {};

    try {
      const res = await api.post('/payment/process', { sessionId, method, payload });
      setTxn(res.data);
      setStep('success');
      onSuccess?.({ transactionId: res.data.transactionId, method, amount });
    } catch (e) {
      setErrorMsg(e.response?.data?.reason || 'Payment failed. Please try again.');
      setStep('failed');
    }
  };

  // ── QR method: poll for completion ────────────────────────────────────
  const pollingRef = useRef(null);
  useEffect(() => {
    if (method === 'qr' && step === 'pay' && sessionId) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/payment/${sessionId}`);
          if (res.data.status === 'success') {
            clearInterval(pollingRef.current);
            setTxn(res.data);
            setStep('success');
            onSuccess?.({ transactionId: res.data.transactionId, method: 'qr', amount });
          }
        } catch {}
      }, 3000);
    }
    return () => clearInterval(pollingRef.current);
  }, [method, step, sessionId]);

  // ── Simulate QR payment for demo ──────────────────────────────────────
  const simulateQrPay = async () => {
    await api.post('/payment/process', { sessionId, method: 'qr', payload: {} }).catch(() => {});
  };

  // ── UPI submit without full form ──────────────────────────────────────
  const canSubmit = () => {
    if (method === 'card') {
      const num = card.number.replace(/\s/g, '');
      return num.length >= 13 && card.expiry.length === 5 && card.cvv.length >= 3 && card.name.trim().length > 1;
    }
    if (method === 'upi')        return upiId.includes('@');
    if (method === 'netbanking') return !!bank;
    if (method === 'cash' || method === 'kiosk_cash' || method === 'qr') return true;
    return false;
  };

  const METHODS = [
    { id: 'card',       icon: <FiCreditCard size={16}/>, label: 'Card' },
    { id: 'upi',        icon: <FiSmartphone size={16}/>, label: 'UPI' },
    { id: 'netbanking', icon: <FiMonitor    size={16}/>, label: 'Net Banking' },
    { id: 'qr',         icon: <span className="text-sm font-bold">QR</span>, label: 'QR Code' },
    { id: 'cash',       icon: <span className="text-lg">💵</span>, label: source === 'kiosk' ? 'In-Store Cash' : 'Cash on Delivery' },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in">

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiShield size={18} className="text-green-400" />
              <span className="text-sm font-semibold tracking-wide">VIKAS Pay · Secure Checkout</span>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                <FiX size={18} />
              </button>
            )}
          </div>
          <div>
            <p className="text-3xl font-bold">₹{parseFloat(amount).toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-0.5">{description || 'VIKAS Purchase'}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* ── INIT ── */}
          {step === 'init' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-10 h-10 border-4 border-airbnb-red border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Initialising secure session…</p>
            </div>
          )}

          {/* ── PAY ── */}
          {step === 'pay' && (
            <div>
              {/* Method tabs — hide if forceMethod */}
              {!forceMethod && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
                  {METHODS.map((m) => (
                    <button key={m.id} onClick={() => setMethod(m.id)}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all
                        ${method === m.id
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Card ── */}
              {method === 'card' && (
                <div className="space-y-4">
                  {/* Visual Card */}
                  <div className={`relative h-40 rounded-2xl p-5 cursor-pointer transition-all duration-500 ${cardFlipped ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'} shadow-xl overflow-hidden`}
                    onClick={() => setCardFlipped((v) => !v)}>
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,56,92,0.5),transparent)]" />
                    {!cardFlipped ? (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-7 bg-yellow-400/80 rounded-md" style={{background: 'linear-gradient(135deg, #fcd34d, #f59e0b)'}} />
                          <span className="text-white text-xs font-bold opacity-80">{cardType || 'VIKAS CARD'}</span>
                        </div>
                        <p className="text-white font-mono text-lg tracking-[0.25em] mb-3">
                          {(card.number || '•••• •••• •••• ••••').padEnd(19, '•').slice(0, 19)}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-gray-400 text-[10px] uppercase">Card Holder</p>
                            <p className="text-white text-sm font-semibold uppercase">{card.name || 'Your Name'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-[10px] uppercase">Expires</p>
                            <p className="text-white text-sm font-semibold">{card.expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col justify-center">
                        <div className="bg-gray-600 h-8 w-full mb-4 rounded" />
                        <div className="flex justify-end gap-2 items-center">
                          <span className="text-gray-400 text-xs">CVV</span>
                          <div className="bg-white text-gray-900 font-mono px-3 py-1 rounded text-sm font-bold tracking-widest">
                            {card.cvv || '•••'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="text" inputMode="numeric" placeholder="Card Number"
                    value={card.number} maxLength={19}
                    onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                    onFocus={() => setCardFlipped(false)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none font-mono tracking-widest text-gray-900 bg-gray-50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text" inputMode="numeric" placeholder="MM/YY"
                      value={card.expiry} maxLength={5}
                      onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      onFocus={() => setCardFlipped(false)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none font-mono text-gray-900 bg-gray-50"
                    />
                    <input
                      type="password" inputMode="numeric" placeholder="CVV"
                      value={card.cvv} maxLength={4}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      onFocus={() => setCardFlipped(true)}
                      onBlur={() => setCardFlipped(false)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none font-mono text-gray-900 bg-gray-50"
                    />
                  </div>
                  <input
                    type="text" placeholder="Name on Card"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    onFocus={() => setCardFlipped(false)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none text-gray-900 bg-gray-50"
                  />
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                    <span className="font-bold">Test cards:</span> End in <code className="bg-blue-100 px-1 rounded">0000</code> for decline,{' '}
                    <code className="bg-blue-100 px-1 rounded">1111</code> for insufficient funds, any other number for success.
                  </div>
                </div>
              )}

              {/* ── UPI ── */}
              {method === 'upi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3 mb-2">
                    {[
                      { name: 'GPay', color: 'from-blue-500 to-green-500', emoji: '🇬' },
                      { name: 'PhonePe', color: 'from-purple-600 to-indigo-600', emoji: '📱' },
                      { name: 'Paytm', color: 'from-blue-400 to-blue-600', emoji: '💳' },
                      { name: 'BHIM', color: 'from-orange-500 to-red-500', emoji: '🇮' },
                    ].map((app) => (
                      <button key={app.name} onClick={() => setUpiId('')}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br ${app.color} text-white text-xs font-bold shadow-md hover:scale-105 transition-transform`}>
                        <span className="text-2xl">{app.emoji}</span>
                        {app.name}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="text" placeholder="Enter UPI ID (e.g. name@upi)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none text-gray-900 bg-gray-50 pr-24"
                    />
                    <button onClick={() => {}} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-lg">
                      Verify
                    </button>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                    Use <code className="bg-blue-100 px-1 rounded">fail@upi</code> to simulate failure,{' '}
                    any valid format (e.g. <code>test@ok</code>) for success.
                  </div>
                </div>
              )}

              {/* ── Net Banking ── */}
              {method === 'netbanking' && (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Select your bank</p>
                  <div className="grid grid-cols-4 gap-2">
                    {BANKS.map((b) => (
                      <button key={b.id} onClick={() => setBank(b.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all
                          ${bank === b.id ? 'bg-gray-900 text-white border-gray-900 scale-105 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                        <span className="text-xl">{b.logo}</span>
                        {b.name}
                      </button>
                    ))}
                  </div>
                  {bank && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                      You will be redirected to <strong>{BANKS.find((b2) => b2.id === bank)?.name}</strong> net banking portal (simulated).
                    </div>
                  )}
                </div>
              )}

              {/* ── QR Code ── */}
              {method === 'qr' && sessionId && (
                <div>
                  <QRDisplay amount={amount} sessionId={sessionId} />
                  <button onClick={simulateQrPay}
                    className="w-full mt-2 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors">
                    [Demo] Simulate scan & pay →
                  </button>
                </div>
              )}

              {/* ── Cash / COD ── */}
              {(method === 'cash' || method === 'kiosk_cash') && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl shadow-inner">💵</div>
                  {source === 'kiosk' ? (
                    <div className="text-center">
                      <p className="font-bold text-gray-900 text-lg mb-1">Pay at Counter</p>
                      <p className="text-sm text-gray-500">Please proceed to the nearest cash counter and present this screen. Amount: <span className="font-bold text-gray-900">₹{parseFloat(amount).toLocaleString()}</span></p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-bold text-gray-900 text-lg mb-1">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay <span className="font-bold text-gray-900">₹{parseFloat(amount).toLocaleString()}</span> when your order arrives. Keep exact change ready.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pay button — hidden for QR (auto-handled) */}
              {method !== 'qr' && (
                <button onClick={pay} disabled={!canSubmit()}
                  className="w-full mt-6 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-gray-800 hover:to-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg">
                  <FiLock size={16} />
                  {method === 'cash' ? 'Confirm Order' : `Pay ₹${parseFloat(amount).toLocaleString()}`}
                  <FiChevronRight size={16} />
                </button>
              )}
            </div>
          )}

          {/* ── PROCESSING ── */}
          {step === 'processing' && (
            <div className="flex flex-col items-center gap-5 py-10">
              <div className="w-16 h-16 border-4 border-airbnb-red border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">Processing Payment…</p>
                <p className="text-sm text-gray-500 mt-1">Please do not close this window</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FiShield size={12} className="text-green-500" />
                256-bit SSL encrypted · PCI-DSS compliant
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center shadow-inner">
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <FiCheck size={28} className="text-white stroke-[3]" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-700 text-xl">Payment Successful!</p>
                <p className="text-sm text-gray-500 mt-1">₹{parseFloat(amount).toLocaleString()} paid via <span className="font-semibold capitalize">{method}</span></p>
              </div>
              <div className="w-full bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono font-bold text-gray-900">{txn?.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900">₹{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-semibold capitalize text-gray-900">{method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-green-600">✓ Confirmed</span>
                </div>
              </div>
              {onClose && (
                <button onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md">
                  Done
                </button>
              )}
            </div>
          )}

          {/* ── FAILED ── */}
          {step === 'failed' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center shadow-inner">
                <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                  <FiAlertCircle size={28} className="text-white stroke-[3]" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-red-600 text-xl">Payment Failed</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">{errorMsg}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => { setStep('pay'); setErrorMsg(''); }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                  <FiRefreshCw size={15} /> Try Again
                </button>
                {onClose && (
                  <button onClick={onClose}
                    className="flex-1 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Security badges */}
          {step === 'pay' && (
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-400 border-t border-gray-100 pt-4">
              <span className="flex items-center gap-1"><FiLock size={11} /> PCI-DSS</span>
              <span className="flex items-center gap-1"><FiShield size={11} /> 256-bit SSL</span>
              <span>Powered by VIKAS Pay</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
