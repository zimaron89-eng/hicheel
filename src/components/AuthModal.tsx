import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  KeyRound, 
  Check, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register, availableUsers, switchUser } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('Reki. @example.com');
  const [loginPassword, setLoginPassword] = useState('SecureP@ssw0rd!2026');
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Strategy Lead');

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setTab(authModalMode);
    setErrorMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdScore = getPasswordStrength(regPassword);
  const strengthLabels = ['Too Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-rose-500', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await login(loginEmail, loginPassword);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to authenticate');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (regPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    const res = await register(regName, regEmail, regPassword, regRole);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create account');
    }
  };

  const handleQuickDemoFill = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('DemoPassword123!');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-[#161618] border border-gray-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">
                {tab === 'login' ? 'Secure Sign In' : 'Create New Account'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Personal Plan Platform credentials & token session
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#121214] border border-gray-800 p-1 m-4 rounded-xl">
          <button
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tab === 'login'
                ? 'bg-[#161618] text-white shadow-xs border border-gray-700/60'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tab === 'register'
                ? 'bg-[#161618] text-white shadow-xs border border-gray-700/60'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mb-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab: Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="p-6 pt-2 space-y-4">
            {/* Quick Demo Fill Pill */}
            <div className="p-3.5 rounded-xl bg-[#121214] border border-gray-800">
              <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-white">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Instant Demo Account
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                  Pre-configured
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-2.5">
                Click below to auto-fill the preloaded architect account with active plans, metrics, and milestones:
              </p>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('Reki. @example.com')}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-gray-200 text-black text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Log in as Reki   (Architect)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  placeholder="Reki. @example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">
                  Password
                </label>
                <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="input-login-password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-700 bg-[#121214] text-indigo-500 focus:ring-indigo-500 accent-indigo-500"
                />
                <span>Remember this session</span>
              </label>
              <span className="text-[10px] text-gray-500">JWT Token Expiry: 30d</span>
            </div>

            <button
              id="btn-auth-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>
          </form>
        ) : (
          /* Tab: Register Form */
          <form onSubmit={handleRegister} className="p-6 pt-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="input-register-name"
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="input-register-email"
                  type="email"
                  required
                  placeholder="jordan@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Role / Profile
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Strategy Lead">Strategy Lead</option>
                <option value="Product Architect">Product Architect</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Individual Contributor">Individual Contributor</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="input-register-password"
                  type="password"
                  required
                  placeholder="Create strong password..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Password strength meter */}
              {regPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-gray-200">{strengthLabels[pwdScore]}</span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full ${
                          step < pwdScore ? strengthColors[pwdScore] : 'bg-gray-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              id="btn-auth-submit-register"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* Footer info badge */}
        <div className="p-3 bg-[#121214] border-t border-gray-800 text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>AES-256 Mock JWT Session • NextAuth & Prisma Ready</span>
        </div>
      </div>
    </div>
  );
};
