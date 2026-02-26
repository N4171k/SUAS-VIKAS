'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
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

  // Login handler
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

  // Register handler (called on stepper final step)
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text inline-block">VIKAS</h1>
          <p className="text-gray-500 mt-2">Virtually Intelligent Knowledge Assisted Shopping</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${
                isLogin ? 'bg-white shadow-sm text-vikas-dark' : 'text-gray-500'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${
                !isLogin ? 'bg-white shadow-sm text-vikas-dark' : 'text-gray-500'
              }`}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            /* ── Login Form ── */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vikas-blue outline-none"
                />
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vikas-blue outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-vikas-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
              >
                {loading ? 'Please wait...' : 'Login'}
              </button>
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Demo: admin@vikas.com / admin123</p>
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
                <div className="space-y-4 pb-2">
                  <h2 className="text-lg font-semibold text-vikas-dark mb-1">Create your account</h2>
                  <p className="text-gray-400 text-sm mb-4">Enter your basic details to get started.</p>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vikas-blue outline-none"
                    />
                  </div>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vikas-blue outline-none"
                    />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 6 chars)"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vikas-blue outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </Step>

              {/* Step 2: Gender & Size */}
              <Step>
                <div className="space-y-5 pb-2">
                  <h2 className="text-lg font-semibold text-vikas-dark">Tell us about yourself</h2>
                  <p className="text-gray-400 text-sm">This helps us personalize your shopping experience.</p>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      {GENDER_OPTIONS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, gender: g })}
                          className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                            form.gender === g
                              ? 'border-vikas-blue bg-blue-50 text-vikas-blue ring-2 ring-vikas-blue/20'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clothing Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clothing Size</label>
                    <div className="flex flex-wrap gap-2">
                      {SIZE_OPTIONS.Clothing.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm({ ...form, clothing_size: s })}
                          className={`w-12 h-10 rounded-lg border text-sm font-medium transition-all ${
                            form.clothing_size === s
                              ? 'border-vikas-blue bg-blue-50 text-vikas-blue ring-2 ring-vikas-blue/20'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footwear Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Footwear Size (US)</label>
                    <div className="flex flex-wrap gap-2">
                      {SIZE_OPTIONS.Footwear.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm({ ...form, footwear_size: s })}
                          className={`w-12 h-10 rounded-lg border text-sm font-medium transition-all ${
                            form.footwear_size === s
                              ? 'border-vikas-blue bg-blue-50 text-vikas-blue ring-2 ring-vikas-blue/20'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 3: Favourite Colors */}
              <Step>
                <div className="space-y-4 pb-2">
                  <h2 className="text-lg font-semibold text-vikas-dark">Pick your favourite colours</h2>
                  <p className="text-gray-400 text-sm">Select up to 5 colours you love wearing.</p>
                  <div className="grid grid-cols-4 gap-3">
                    {COLOR_OPTIONS.map((c) => {
                      const selected = form.favourite_colors.includes(c.name);
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => toggleColor(c.name)}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                            selected
                              ? 'border-vikas-blue bg-blue-50 ring-2 ring-vikas-blue/20'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span
                            className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                            style={{
                              backgroundColor: c.hex,
                              borderColor: c.name === 'White' ? '#d1d5db' : c.hex,
                            }}
                          >
                            {selected && (
                              <svg className="w-4 h-4" fill="none" stroke={c.name === 'White' || c.name === 'Yellow' || c.name === 'Beige' ? '#000' : '#fff'} strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {form.favourite_colors.length > 0 && (
                    <p className="text-xs text-gray-400 text-center">
                      {form.favourite_colors.length}/5 selected
                    </p>
                  )}
                </div>
              </Step>

              {/* Step 4: Style Preferences */}
              <Step>
                <div className="space-y-4 pb-2">
                  <h2 className="text-lg font-semibold text-vikas-dark">What's your style?</h2>
                  <p className="text-gray-400 text-sm">Choose up to 4 styles that define you.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLE_OPTIONS.map((s) => {
                      const selected = form.style_preferences.includes(s.label);
                      return (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => toggleStyle(s.label)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            selected
                              ? 'border-vikas-blue bg-blue-50 ring-2 ring-vikas-blue/20'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl">{s.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                            <p className="text-xs text-gray-400">{s.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {form.style_preferences.length > 0 && (
                    <p className="text-xs text-gray-400 text-center">
                      {form.style_preferences.length}/4 selected
                    </p>
                  )}
                </div>
              </Step>
            </Stepper>
          )}
        </div>
      </div>
    </div>
  );
}
