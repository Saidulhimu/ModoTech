import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuthStore, isAdminEmail } from '../store/authStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../lib/firebase';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Google OAuth via Firebase - Extracts REAL user profile (never fake placeholder)
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser) {
        throw new Error('Google sign-in did not return user details.');
      }

      const email = (firebaseUser.email || '').trim().toLowerCase();
      const name = firebaseUser.displayName || email.split('@')[0] || 'User';
      const avatar = firebaseUser.photoURL || '';
      const role = isAdminEmail(email) ? 'admin' : 'user';

      const realUser = {
        _id: firebaseUser.uid,
        name,
        email,
        avatar,
        role,
      };

      let token = 'fb_' + firebaseUser.uid;

      // Silently synchronize with backend if available
      try {
        const { data } = await api.post('/auth/google', {
          name: realUser.name,
          email: realUser.email,
          avatar: realUser.avatar,
        });
        if (data?.user) {
          token = data.token || token;
          if (data.user.role) realUser.role = data.user.role;
        }
      } catch {
        // Backend offline / Vercel static — purely normal, we already have real Google user!
      }

      setAuth(realUser, token);
      toast.success(`Welcome back, ${realUser.name}! 👋`, {
        style: { borderRadius: '12px' },
      });
      navigate(redirectPath);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup window, no error toast needed
        return;
      }
      console.error('Google Sign-In Error:', err);
      toast.error(err.message || 'Google sign-in failed. Please verify Firebase settings.', {
        style: { borderRadius: '12px' },
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.token);

      try {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } catch {
        // Firebase sync optional
      }

      toast.success(`Welcome back, ${data.user.name}! 👋`, {
        style: { borderRadius: '12px' },
      });
      navigate(redirectPath);
    } catch (err) {
      // If backend is offline, attempt direct Firebase authentication
      try {
        const result = await signInWithEmailAndPassword(auth, form.email, form.password);
        const fbUser = result.user;
        const email = (fbUser.email || form.email).trim().toLowerCase();
        const role = isAdminEmail(email) ? 'admin' : 'user';
        const userObj = {
          _id: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email,
          avatar: fbUser.photoURL || '',
          role,
        };
        setAuth(userObj, 'fb_' + fbUser.uid);
        toast.success(`Welcome back, ${userObj.name}! 👋`, {
          style: { borderRadius: '12px' },
        });
        navigate(redirectPath);
      } catch {
        toast.error(err.response?.data?.message || 'Invalid email or password', {
          style: { borderRadius: '12px' },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      {/* Top Brand Area */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <img src="/logo.svg" alt="ModoTech" className="h-9 w-auto" />
          <span className="text-2xl font-black tracking-tight text-dark">
            Modo<span className="text-primary">Tech</span>
          </span>
        </Link>
        <h2 className="mt-5 text-2xl font-black text-dark tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Sign in to your ModoTech account
        </p>
      </div>

      {/* Main Clean Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-gray-150 rounded-3xl space-y-6">

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 hover:border-gray-300 rounded-2xl font-semibold text-xs sm:text-sm text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60"
          >
            <FcGoogle size={20} />
            <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-gray-150" />
            <span className="absolute bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <a href="#" className="text-[11px] text-primary hover:underline font-semibold">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-primary/20 active:scale-[0.99] transition-transform disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create one
              </Link>
            </p>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-dark transition-colors"
          >
            <FiArrowLeft size={13} /> Back to Store
          </Link>
        </div>

      </div>
    </div>
  );
}
