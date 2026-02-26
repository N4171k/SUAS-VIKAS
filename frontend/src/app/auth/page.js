'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../../lib/authContext';
import Stepper, { Step } from '../../../components/Stepper';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const SIZE_OPTIONS = {
  Clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  Footwear: ['6', '7', '8', '9', '10', '11', '12', '13'],
};
const COLOR_OPTIONS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Beige', hex: '#D2B48C' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Maroon', hex: '#7F1D1D' },
  { name: 'Coral', hex: '#F87171' },
];
const STYLE_OPTIONS = [
  { label: 'Casual', icon: '👕', desc: 'Everyday relaxed wear' },
  { label: 'Formal', icon: '👔', desc: 'Office & business attire' },
  { label: 'Sporty', icon: '🏃', desc: 'Athletic & activewear' },
  { label: 'Ethnic', icon: '🪷', desc: 'Traditional & cultural' },
  { label: 'Streetwear', icon: '🧢', desc: 'Urban & trendy' },
  { label: 'Minimalist', icon: '✨', desc: 'Clean & simple' },
  { label: 'Bohemian', icon: '🌸', desc: 'Free-spirited & artsy' },
  { label: 'Party', icon: '🎉', desc: 'Night-out & glam' },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    clothing_size: '',
    footwear_size: '',
    favourite_colors: [],
    style_preferences: [],
  });

  const { login, register } = useAuth();
  const router = useRouter();

  const toggleColor = (color) => {
    setForm((prev) => ({
      ...prev,
      favourite_colors: prev.favourite_colors.includes(color)
        ? prev.favourite_colors.filter((c) => c !== color)
        : prev.favourite_colors.length < 5
        ? [...prev.favourite_colors, color]
        : prev.favourite_colors,
    }));
  };

  const toggleStyle = (style) => {
    setForm((prev) => ({
      ...prev,
      style_preferences: prev.style_preferences.includes(style)
        ? prev.style_preferences.filter((s) => s !== style)
        : prev.style_preferences.length < 4
        ? [...prev.style_preferences, style]
        : prev.style_preferences,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, {
        gender: form.gender,
        clothing_size: form.clothing_size,
        footwear_size: form.footwear_size,
        favourite_colors: form.favourite_colors,
        style_preferences: form.style_preferences,
      });
      toast.success('Account created!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --red: #FF385C;
          --red-dark: #E61E4D;
          --red-deep: #881337;
          --dark: #222222;
          --muted: #717171;
          --bg: #F7F7F7;
          --surface: #FFFFFF;
          --warm: #F2F0E9;
          --slate: #1e293b;
          --green: #00A878;
          --clay-shadow: 6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff;
          --clay-inset: inset 3px 3px 7px #d1d1d1, inset -3px -3px 7px #ffffff;
        }

        .vikas-page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .vikas-page::before {
          content: '';
          position: fixed;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,56,92,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .vikas-page::after {
          content: '';
          position: fixed;
          bottom: -150px;
          left: -150px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,168,120,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .auth-card {
          background: var(--surface);
          border-radius: 24px;
          box-shadow: var(--clay-shadow);
          width: 100%;
          max-width: 480px;
          padding: 2.5rem 2.5rem;
          position: relative;
          z-index: 1;
        }

        /* ── Brand Header ── */
        .brand-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%);
          border-radius: 14px;
          margin-bottom: 0.75rem;
          box-shadow: 0 4px 15px rgba(255,56,92,0.35);
        }

        .brand-logo span {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
          letter-spacing: -1px;
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #CC5833 0%, #2E4036 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 0.3rem;
        }

        .brand-tagline {
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* ── Tab Toggle ── */
        .tab-toggle {
          display: flex;
          background: var(--bg);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 2rem;
          box-shadow: var(--clay-inset);
        }

        .tab-btn {
          flex: 1;
          padding: 0.6rem 1rem;
          border: none;
          background: transparent;
          border-radius: 9px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--muted);
        }

        .tab-btn.active {
          background: var(--surface);
          color: var(--dark);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          font-weight: 600;
        }

        /* ── Input Fields ── */
        .input-group {
          position: relative;
          margin-bottom: 1rem;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          font-size: 0.95rem;
          z-index: 1;
          pointer-events: none;
        }

        .vikas-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.6rem;
          border: 1.5px solid #E8E8E8;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: var(--dark);
          background: var(--surface);
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .vikas-input:focus {
          border-color: var(--red);
          box-shadow: 0 0 0 3px rgba(255,56,92,0.1);
        }

        .vikas-input::placeholder {
          color: #BABABA;
        }

        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .eye-btn:hover { color: var(--dark); }

        /* ── Primary Button ── */
        .btn-primary {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(255,56,92,0.3);
          letter-spacing: 0.02em;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255,56,92,0.4);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* ── Demo hint ── */
        .demo-hint {
          text-align: center;
          margin-top: 1rem;
          padding: 0.6rem 1rem;
          background: var(--warm);
          border-radius: 10px;
          font-size: 0.78rem;
          color: var(--muted);
        }

        .demo-hint strong {
          color: var(--dark);
          font-weight: 600;
        }

        /* ── Step Headers ── */
        .step-header {
          margin-bottom: 1.5rem;
        }

        .step-label {
          display: inline-block;
          background: linear-gradient(135deg, rgba(255,56,92,0.1), rgba(255,56,92,0.05));
          color: var(--red);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          margin-bottom: 0.5rem;
          border: 1px solid rgba(255,56,92,0.2);
        }

        .step-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 0.3rem;
        }

        .step-subtitle {
          font-size: 0.83rem;
          color: var(--muted);
          margin: 0;
        }

        /* ── Section Labels ── */
        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.6rem;
          margin-top: 1.25rem;
        }

        .section-label:first-child {
          margin-top: 0;
        }

        /* ── Gender Pills ── */
        .pill-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .pill-btn {
          padding: 0.5rem 1rem;
          border-radius: 50px;
          border: 1.5px solid #E8E8E8;
          background: var(--surface);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .pill-btn:hover:not(.selected) {
          border-color: #CCCCCC;
          color: var(--dark);
        }

        .pill-btn.selected {
          background: linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%);
          border-color: transparent;
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(255,56,92,0.3);
        }

        /* ── Size Grid ── */
        .size-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .size-btn {
          width: 46px;
          height: 42px;
          border-radius: 10px;
          border: 1.5px solid #E8E8E8;
          background: var(--surface);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .size-btn:hover:not(.selected) {
          border-color: #CCCCCC;
          color: var(--dark);
        }

        .size-btn.selected {
          background: var(--dark);
          border-color: var(--dark);
          color: white;
          box-shadow: 0 2px 8px rgba(34,34,34,0.25);
        }

        /* ── Color Grid ── */
        .color-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 0.6rem;
        }

        .color-swatch {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
          padding: 0.4rem 0.2rem;
          border-radius: 10px;
          border: 1.5px solid transparent;
          transition: all 0.18s ease;
        }

        .color-swatch:hover {
          background: var(--bg);
        }

        .color-swatch.selected {
          border-color: var(--red);
          background: rgba(255,56,92,0.04);
        }

        .color-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          position: relative;
          border: 2px solid rgba(0,0,0,0.08);
          transition: transform 0.15s ease;
        }

        .color-swatch:hover .color-circle {
          transform: scale(1.1);
        }

        .color-check {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(0,0,0,0.3);
        }

        .color-check svg {
          width: 12px;
          height: 12px;
          stroke: white;
          stroke-width: 3;
        }

        .color-name {
          font-size: 0.6rem;
          font-weight: 500;
          color: var(--muted);
          text-align: center;
          line-height: 1.2;
        }

        /* ── Style Cards ── */
        .style-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }

        .style-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0.875rem;
          border-radius: 12px;
          border: 1.5px solid #E8E8E8;
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .style-card:hover:not(.selected) {
          border-color: #CCCCCC;
          background: var(--bg);
        }

        .style-card.selected {
          border-color: var(--red);
          background: rgba(255,56,92,0.04);
          box-shadow: 0 2px 10px rgba(255,56,92,0.12);
        }

        .style-icon {
          font-size: 1.4rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .style-label {
          font-size: 0.83rem;
          font-weight: 600;
          color: var(--dark);
          margin: 0 0 0.1rem;
        }

        .style-desc {
          font-size: 0.7rem;
          color: var(--muted);
          margin: 0;
          line-height: 1.3;
        }

        /* ── Selection Counter ── */
        .selection-counter {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.75rem;
          padding: 0.35rem 0.75rem;
          background: var(--warm);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--dark);
        }

        .counter-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--red);
        }

        /* ── Divider ── */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #E8E8E8, transparent);
          margin: 1.5rem 0;
        }
      `}</style>

      <div className="vikas-page">
        <div className="auth-card">
          {/* Brand Header */}
          <div className="brand-header">
            <div className="brand-logo">
              <span>V</span>
            </div>
            <div className="brand-name">VIKAS</div>
            <div className="brand-tagline">Virtually Intelligent Knowledge Assisted Shopping</div>
          </div>

          {/* Tab Toggle */}
          <div className="tab-toggle">
            <button
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            /* ── Login Form ── */
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="vikas-input"
                />
              </div>

              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="vikas-input"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Please wait…' : 'Login'}
                </button>
              </div>

              <div className="demo-hint">
                Demo: <strong>admin@vikas.com</strong> / <strong>admin123</strong>
              </div>
            </form>
          ) : (
            /* ── Registration Stepper ── */
            <Stepper
              initialStep={1}
              onStepChange={() => {}}
              onFinalStepCompleted={handleRegister}
              backButtonText="Previous"
              nextButtonText="Next"
              disableStepIndicators={false}
            >
              {/* Step 1: Basic Info */}
              <Step>
                <div className="step-header">
                  <span className="step-label">Step 1 of 4</span>
                  <h2 className="step-title">Create your account</h2>
                  <p className="step-subtitle">Enter your basic details to get started.</p>
                </div>

                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="vikas-input"
                  />
                </div>

                <div className="input-group">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="vikas-input"
                  />
                </div>

                <div className="input-group">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="vikas-input"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </Step>

              {/* Step 2: Gender & Size */}
              <Step>
                <div className="step-header">
                  <span className="step-label">Step 2 of 4</span>
                  <h2 className="step-title">Tell us about yourself</h2>
                  <p className="step-subtitle">This helps us personalize your shopping experience.</p>
                </div>

                <div className="section-label">Gender</div>
                <div className="pill-group">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`pill-btn ${form.gender === g ? 'selected' : ''}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <div className="section-label">Clothing Size</div>
                <div className="size-grid">
                  {SIZE_OPTIONS.Clothing.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, clothing_size: s })}
                      className={`size-btn ${form.clothing_size === s ? 'selected' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="section-label">Footwear Size (US)</div>
                <div className="size-grid">
                  {SIZE_OPTIONS.Footwear.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, footwear_size: s })}
                      className={`size-btn ${form.footwear_size === s ? 'selected' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Step>

              {/* Step 3: Favourite Colors */}
              <Step>
                <div className="step-header">
                  <span className="step-label">Step 3 of 4</span>
                  <h2 className="step-title">Pick your favourite colours</h2>
                  <p className="step-subtitle">Select up to 5 colours you love wearing.</p>
                </div>

                <div className="color-grid">
                  {COLOR_OPTIONS.map((c) => {
                    const selected = form.favourite_colors.includes(c.name);
                    return (
                      <div
                        key={c.name}
                        onClick={() => toggleColor(c.name)}
                        className={`color-swatch ${selected ? 'selected' : ''}`}
                      >
                        <div
                          className="color-circle"
                          style={{
                            backgroundColor: c.hex,
                            border: c.hex === '#FFFFFF' ? '2px solid #E8E8E8' : '2px solid rgba(0,0,0,0.06)',
                          }}
                        >
                          {selected && (
                            <div className="color-check">
                              <svg viewBox="0 0 12 12" fill="none">
                                <polyline points="2,6 5,9 10,3" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="color-name">{c.name}</span>
                      </div>
                    );
                  })}
                </div>

                {form.favourite_colors.length > 0 && (
                  <div>
                    <div className="selection-counter">
                      <div className="counter-dot" />
                      {form.favourite_colors.length}/5 selected
                    </div>
                  </div>
                )}
              </Step>

              {/* Step 4: Style Preferences */}
              <Step>
                <div className="step-header">
                  <span className="step-label">Step 4 of 4</span>
                  <h2 className="step-title">What's your style?</h2>
                  <p className="step-subtitle">Choose up to 4 styles that define you.</p>
                </div>

                <div className="style-grid">
                  {STYLE_OPTIONS.map((s) => {
                    const selected = form.style_preferences.includes(s.label);
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => toggleStyle(s.label)}
                        className={`style-card ${selected ? 'selected' : ''}`}
                      >
                        <span className="style-icon">{s.icon}</span>
                        <div>
                          <p className="style-label">{s.label}</p>
                          <p className="style-desc">{s.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {form.style_preferences.length > 0 && (
                  <div>
                    <div className="selection-counter">
                      <div className="counter-dot" />
                      {form.style_preferences.length}/4 selected
                    </div>
                  </div>
                )}
              </Step>
            </Stepper>
          )}
        </div>
      </div>
    </>
  );
}