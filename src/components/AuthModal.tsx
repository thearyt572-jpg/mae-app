/**
 * ម៉ែ — by FlowErs
 * Authentication Modal
 *
 * Implements Sign Up and Log In with show/hide password, validation,
 * error handling, and demo Mama shortcut.
 * Default interface is Khmer first.
 */

import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    t,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authModalMode === 'signup') {
        if (password !== confirmPassword) {
          setErrorMessage(t('ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ។ សូមពិនិត្យឡើងវិញ។', 'Passwords do not match. Please re-check.'));
          setIsLoading(false);
          return;
        }
        const res = await signup(name, email, password);
        if (!res.success) {
          setErrorMessage(res.error || t('ការចុះឈ្មោះមិនបានសម្រេច។', 'Sign up failed.'));
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || t('ការចូលប្រើប្រាស់មិនបានសម្រេច។', 'Login failed.'));
        }
      }
    } catch {
      setErrorMessage(t('មានបញ្ហាបច្ចេកទេស។ សូមសាកល្បងម្តងទៀត។', 'An unexpected error occurred. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#FAF9F5] border border-[#E5EADF] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#E5EADF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-lg shadow-2xs">
              🌸
            </span>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#233125]">
                {authModalMode === 'signup'
                  ? t('ចាប់ផ្ដើមដំណើរក្លាយជាម្តាយ', 'Begin Your Journey')
                  : t('សូមស្វាគមន៍ការត្រឡប់មកវិញ', 'Welcome Back')}
              </h2>
              <p className="text-xs text-[#5F6E60]">
                {t('ម៉ែ — កម្មវិធីកំដរស្រ្តីមានផ្ទៃពោះលើកដំបូង', 'A gentle companion for first-time mothers')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 text-[#5F6E60] hover:text-[#233125] rounded-full hover:bg-[#FAF9F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E5EADF] bg-[#FAF9F5]">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors ${
              authModalMode === 'signup'
                ? 'text-[#233125] bg-white border-b-2 border-[#88A04D]'
                : 'text-[#5F6E60] hover:text-[#233125]'
            }`}
          >
            {t('ចុះឈ្មោះថ្មី (Sign Up)', 'Sign Up')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors ${
              authModalMode === 'login'
                ? 'text-[#233125] bg-white border-b-2 border-[#88A04D]'
                : 'text-[#5F6E60] hover:text-[#233125]'
            }`}
          >
            {t('ចូលប្រើ (Log In)', 'Log In')}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#233125] mb-1">
                {t('ឈ្មោះរបស់កូន (Name)', 'Your Name')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('ឧទាហរណ៍៖ ចាន់ថន ឬ ស្រីស្រស់', 'e.g. Chanthon')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5EADF] text-xs sm:text-sm text-[#233125] focus:border-[#88A04D] focus:ring-1 focus:ring-[#88A04D]"
                />
                <UserIcon className="w-4 h-4 text-[#5F6E60] absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#233125] mb-1">
              {t('អ៊ីមែល (Email)', 'Email Address')} *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5EADF] text-xs sm:text-sm text-[#233125] focus:border-[#88A04D] focus:ring-1 focus:ring-[#88A04D]"
              />
              <Mail className="w-4 h-4 text-[#5F6E60] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#233125] mb-1">
              {t('ពាក្យសម្ងាត់ (Password)', 'Password')} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#E5EADF] text-xs sm:text-sm text-[#233125] focus:border-[#88A04D] focus:ring-1 focus:ring-[#88A04D]"
              />
              <Lock className="w-4 h-4 text-[#5F6E60] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#5F6E60] hover:text-[#233125]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#233125] mb-1">
                {t('បញ្ជាក់ពាក្យសម្ងាត់ (Confirm Password)', 'Confirm Password')} *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#E5EADF] text-xs sm:text-sm text-[#233125] focus:border-[#88A04D] focus:ring-1 focus:ring-[#88A04D]"
                />
                <Lock className="w-4 h-4 text-[#5F6E60] absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-[#5F6E60] hover:text-[#233125]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-50 mt-2"
          >
            {isLoading
              ? t('កំពុងដំណើរការ...', 'Processing...')
              : authModalMode === 'signup'
              ? t('បង្កើតគណនី', 'Create Account')
              : t('ចូលប្រើប្រាស់', 'Log In')}
          </button>

        </form>
      </div>
    </div>
  );
};
