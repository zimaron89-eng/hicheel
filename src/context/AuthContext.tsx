import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { Storage } from '../lib/storage';
import { INITIAL_USER } from '../data/initialData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  availableUsers: User[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => Storage.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [availableUsers, setAvailableUsers] = useState<User[]>(() => Storage.getAllUsers());

  useEffect(() => {
    const current = Storage.getCurrentUser();
    setUser(current);
    setAvailableUsers(Storage.getAllUsers());
  }, []);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    // Check if user exists in registered list
    const users = Storage.getAllUsers();
    let found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      // If it's a demo attempt, allow creating on the fly or provide realistic demo user
      if (email.toLowerCase().includes('demo') || email.toLowerCase().includes('Reki')) {
        found = INITIAL_USER;
      } else {
        return { success: false, error: 'No account found with this email. Please check your credentials or register.' };
      }
    }

    Storage.setCurrentUser(found);
    setUser(found);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const register = async (name: string, email: string, _password?: string, role = 'Personal Planner'): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim() || !email.trim()) {
      return { success: false, error: 'Name and email are required.' };
    }

    const users = Storage.getAllUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=3b82f6,6366f1,8b5cf6`,
      role,
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
    };

    Storage.saveUser(newUser);
    setUser(newUser);
    setAvailableUsers(Storage.getAllUsers());
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logout = () => {
    Storage.setCurrentUser(null);
    setUser(null);
  };

  const switchUser = (userId: string) => {
    const users = Storage.getAllUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      Storage.setCurrentUser(target);
      setUser(target);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    Storage.saveUser(updated);
    setUser(updated);
    setAvailableUsers(Storage.getAllUsers());
  };

  const resetDemoData = () => {
    Storage.resetDemoData();
    setUser(INITIAL_USER);
    setAvailableUsers(Storage.getAllUsers());
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        availableUsers,
        login,
        register,
        logout,
        switchUser,
        openAuthModal,
        closeAuthModal,
        updateUserProfile,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
