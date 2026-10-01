import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Storage } from '../lib/storage';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Key, 
  Download, 
  RefreshCw, 
  LogOut, 
  Check, 
  Users
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, availableUsers, switchUser, updateUserProfile, resetDemoData } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || '');
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || user.name,
      role: role.trim() || user.role,
      twoFactorEnabled: twoFactor,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const plans = Storage.getPlans(user.id);
    const tasks = Storage.getTasks();
    const exportPayload = {
      user,
      plans,
      tasks: tasks.filter(t => plans.some(p => p.id === t.planId)),
      activityLogs: Storage.getActivity().filter(a => a.userId === user.id),
      exportedAt: new Date().toISOString(),
      format: 'PrismaJSONv1',
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal-plans-${user.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#161618] border border-gray-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <h3 className="text-base font-semibold text-white">
                {user.name}
              </h3>
              <p className="text-xs text-gray-400">
                {user.email} • {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Switch Account Quick List */}
          {availableUsers.length > 1 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Switch Profile Session
              </h4>
              <div className="space-y-1.5">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      u.id === user.id
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                        : 'hover:bg-gray-800/80 text-gray-300 border border-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-300 border border-gray-700">
                        {u.name.charAt(0)}
                      </div>
                      <span className="truncate">{u.name} ({u.role})</span>
                    </div>
                    {u.id === user.id && <Check className="w-3.5 h-3.5 shrink-0 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#121214] border border-gray-800 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Security settings */}
            <div className="p-3.5 rounded-xl bg-[#121214] border border-gray-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Two-Factor Authentication (2FA)
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Require TOTP authenticator code on session renewal
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="text-[11px] text-gray-400 pt-1.5 border-t border-gray-800 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-indigo-400" />
                <span>Session Token: <code className="font-mono text-gray-500">sess_cuid_aes256_...</code></span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              {savedSuccess ? 'Changes Saved!' : 'Update Profile Details'}
            </button>
          </form>

          {/* Export & Reset Actions */}
          <div className="pt-4 border-t border-gray-800 space-y-2">
            <button
              onClick={handleExportData}
              className="w-full py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Export Personal Plans & Tasks (JSON)
            </button>

            <button
              onClick={resetDemoData}
              className="w-full py-2 px-3 rounded-xl bg-gray-800/40 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo State to Defaults
            </button>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out of Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
