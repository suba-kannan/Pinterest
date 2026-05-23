import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';

export default function AuthModals() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeModal = searchParams.get('modal');

  const { login, register, error, setError, user } = useContext(AuthContext);

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Signup States
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);

  // Reset errors on modal change
  useEffect(() => {
    setError(null);
  }, [activeModal, setError]);

  // Handle successful login/signup from context user state
  useEffect(() => {
    if (user && activeModal) {
      // Clear modal param
      const params = new URLSearchParams(location.search);
      params.delete('modal');
      const searchStr = params.toString();
      navigate(location.pathname + (searchStr ? `?${searchStr}` : ''));
    }
  }, [user, activeModal, navigate, location.pathname, location.search]);

  // Seed initial email if passed from home landing page email box
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialEmail = params.get('email');
    if (initialEmail && activeModal === 'signup') {
      setSignupEmail(initialEmail);
    }
  }, [activeModal, location.search]);

  const handleClose = () => {
    const params = new URLSearchParams(location.search);
    params.delete('modal');
    params.delete('email');
    const searchStr = params.toString();
    navigate(location.pathname + (searchStr ? `?${searchStr}` : ''));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoginSubmitting(true);
    setError(null);
    try {
      await login(loginEmail.trim(), loginPassword);
    } catch (err) {
      // Handled in Context
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupUsername || !signupEmail || !signupPassword) return;
    setSignupSubmitting(true);
    setError(null);
    try {
      await register(signupUsername.trim(), signupEmail.trim().toLowerCase(), signupPassword);
    } catch (err) {
      // Handled in Context
    } finally {
      setSignupSubmitting(false);
    }
  };

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="bg-white rounded-[32px] p-8 md:p-10 max-w-md w-full shadow-2xl border border-gray-100 relative z-10 animate-scaleIn max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Pinterest Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-11 h-11 bg-[#E60023] rounded-full flex items-center justify-center mb-2 shadow-md">
            <span className="text-white font-bold text-xl font-serif">P</span>
          </div>
          <h2 className="text-2xl font-black text-[#111111] tracking-tight">
            {activeModal === 'login' ? 'Welcome to Pinterest' : 'Create your account'}
          </h2>
          <p className="text-gray-400 text-xs font-semibold mt-1">Find style, decor, and recipes to try</p>
        </div>

        {/* Errors display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* 1. Login form */}
        {activeModal === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter email or username"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-xs text-gray-800 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-xs text-gray-800 transition-all duration-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3 bg-[#E60023] hover:bg-[#AD0018] disabled:bg-red-400 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 mt-2"
            >
              {loginSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-100 mt-6">
              <p className="text-xs text-gray-500">
                Not on Pinterest yet?{' '}
                <button
                  type="button"
                  onClick={() => navigate('?modal=signup')}
                  className="text-[#E60023] font-bold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 2. Signup form */}
        {activeModal === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                placeholder="Choose a unique username"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-xs text-gray-800 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-xs text-gray-800 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-red-100 focus:border-[#E60023] outline-none text-xs text-gray-800 transition-all duration-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={signupSubmitting}
              className="w-full py-3 bg-[#E60023] hover:bg-[#AD0018] disabled:bg-red-400 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 mt-2"
            >
              {signupSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-100 mt-6">
              <p className="text-xs text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('?modal=login')}
                  className="text-[#E60023] font-bold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
