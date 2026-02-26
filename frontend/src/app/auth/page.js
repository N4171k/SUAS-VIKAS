'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../../lib/authContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text inline-block">VIKAS</h1>
          <p className="text-gray-500 mt-2">Virtually Intelligent Knowledge Assisted Shopping</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${isLogin ? 'bg-white shadow-sm text-vikas-dark' : 'text-gray-500'}`}>
              Login
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${!isLogin ? 'bg-white shadow-sm text-vikas-dark' : 'text-gray-500'}`}>
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                <input type="text" placeholder="Full Name" required={!isLogin} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vikas-blue outline-none" />
              </div>
            )}
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-gray-400" />
              <input type="email" placeholder="Email address" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vikas-blue outline-none" />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vikas-blue outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-vikas-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50">
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Demo: admin@vikas.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
