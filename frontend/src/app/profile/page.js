'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../../lib/authContext';

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

export default function ProfilePage() {
  const { user, loading: authLoading, updatePreferences, logout } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    gender: '',
    clothing_size: '',
    footwear_size: '',
    favourite_colors: [],
    style_preferences: [],
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  // Pre-fill from current user data
  useEffect(() => {
    if (user) {
      setForm({
        gender: user.gender || '',
        clothing_size: user.clothing_size || '',
        footwear_size: user.footwear_size || '',
        favourite_colors: Array.isArray(user.favourite_colors) ? user.favourite_colors : [],
        style_preferences: Array.isArray(user.style_preferences) ? user.style_preferences : [],
      });
    }
  }, [user]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(form);
      toast.success('Preferences saved! Your home feed will update.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-airbnb-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --red: #FF385C; --red-dark: #E61E4D; --dark: #222222; --muted: #717171;
          --bg: #F7F7F7; --surface: #FFFFFF; --warm: #F2F0E9;
          --clay-shadow: 6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff;
        }
        .profile-page { min-height: 100vh; background: var(--bg); font-family: 'DM Sans', sans-serif; padding: 6rem 1rem 4rem; }
        .profile-card { background: var(--surface); border-radius: 24px; box-shadow: var(--clay-shadow); width: 100%; max-width: 600px; margin: 0 auto; padding: 2.5rem; }
        .section-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem; margin-top: 1.5rem; }
        .section-label:first-child { margin-top: 0; }
        .pill-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .pill-btn { padding: 0.5rem 1rem; border-radius: 50px; border: 1.5px solid #E8E8E8; background: var(--surface); font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.18s ease; }
        .pill-btn:hover:not(.selected) { border-color: #CCCCCC; color: var(--dark); }
        .pill-btn.selected { background: linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%); border-color: transparent; color: white; font-weight: 600; box-shadow: 0 2px 10px rgba(255,56,92,0.3); }
        .size-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; }
        .size-btn { width: 46px; height: 42px; border-radius: 10px; border: 1.5px solid #E8E8E8; background: var(--surface); font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600; color: var(--muted); cursor: pointer; transition: all 0.18s ease; }
        .size-btn:hover:not(.selected) { border-color: #CCCCCC; color: var(--dark); }
        .size-btn.selected { background: var(--dark); border-color: var(--dark); color: white; box-shadow: 0 2px 8px rgba(34,34,34,0.25); }
        .color-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.6rem; }
        .color-swatch { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.4rem 0.2rem; border-radius: 10px; border: 1.5px solid transparent; transition: all 0.18s ease; }
        .color-swatch:hover { background: var(--bg); }
        .color-swatch.selected { border-color: var(--red); background: rgba(255,56,92,0.04); }
        .color-circle { width: 30px; height: 30px; border-radius: 50%; position: relative; border: 2px solid rgba(0,0,0,0.08); transition: transform 0.15s ease; }
        .color-swatch:hover .color-circle { transform: scale(1.1); }
        .color-check { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(0,0,0,0.3); }
        .color-check svg { width: 12px; height: 12px; stroke: white; stroke-width: 3; }
        .color-name { font-size: 0.6rem; font-weight: 500; color: var(--muted); text-align: center; line-height: 1.2; }
        .style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
        .style-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0.875rem; border-radius: 12px; border: 1.5px solid #E8E8E8; background: var(--surface); cursor: pointer; text-align: left; transition: all 0.18s ease; font-family: 'DM Sans', sans-serif; }
        .style-card:hover:not(.selected) { border-color: #CCCCCC; background: var(--bg); }
        .style-card.selected { border-color: var(--red); background: rgba(255,56,92,0.04); box-shadow: 0 2px 10px rgba(255,56,92,0.12); }
        .style-icon { font-size: 1.4rem; line-height: 1; flex-shrink: 0; }
        .style-label { font-size: 0.83rem; font-weight: 600; color: var(--dark); margin: 0 0 0.1rem; }
        .style-desc { font-size: 0.7rem; color: var(--muted); margin: 0; line-height: 1.3; }
        .selection-counter { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.75rem; padding: 0.35rem 0.75rem; background: var(--warm); border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: var(--dark); }
        .counter-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--red); }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #E8E8E8, transparent); margin: 1.75rem 0; }
        .save-btn { width: 100%; padding: 0.875rem; background: linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%); color: white; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(255,56,92,0.3); }
        .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,56,92,0.4); }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div className="profile-page">
        <div className="profile-card">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <FiArrowLeft size={16} /> Back to home
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiLogOut size={15} /> Sign out
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-airbnb-red">
              <FiUser size={22} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg leading-tight">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="divider" />

          {/* Gender */}
          <div className="section-label">Gender</div>
          <div className="pill-group">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, gender: prev.gender === g ? '' : g }))}
                className={`pill-btn ${form.gender === g ? 'selected' : ''}`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="divider" />

          {/* Clothing Size */}
          <div className="section-label">Clothing Size</div>
          <div className="size-grid">
            {SIZE_OPTIONS.Clothing.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, clothing_size: prev.clothing_size === s ? '' : s }))}
                className={`size-btn ${form.clothing_size === s ? 'selected' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Footwear Size */}
          <div className="section-label">Footwear Size (US)</div>
          <div className="size-grid">
            {SIZE_OPTIONS.Footwear.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, footwear_size: prev.footwear_size === s ? '' : s }))}
                className={`size-btn ${form.footwear_size === s ? 'selected' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="divider" />

          {/* Favourite Colours */}
          <div className="section-label">Favourite Colours <span style={{ textTransform: 'none', color: '#BABABA', fontWeight: 400 }}>(up to 5)</span></div>
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
            <div className="selection-counter mt-3">
              <div className="counter-dot" />
              {form.favourite_colors.length}/5 selected
            </div>
          )}

          <div className="divider" />

          {/* Style Preferences */}
          <div className="section-label">Style Preferences <span style={{ textTransform: 'none', color: '#BABABA', fontWeight: 400 }}>(up to 4)</span></div>
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
            <div className="selection-counter mt-3">
              <div className="counter-dot" />
              {form.style_preferences.length}/4 selected
            </div>
          )}

          <div className="divider" />

          {/* Save Button */}
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : (
              <span className="flex items-center justify-center gap-2">
                <FiCheck size={18} /> Save Preferences
              </span>
            )}
          </button>

        </div>
      </div>
    </>
  );
}
