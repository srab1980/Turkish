'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student';
  profileImage?: string;
  permissions: string[];
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAdminAccess: boolean;
  hasTeacherAccess: boolean;
}

export interface InterfaceAuthHook {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchInterface: (targetInterface: 'admin' | 'user') => void;
  checkPermission: (permission: string) => boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const STORAGE_KEY = 'turkish_learning_auth';
const ADMIN_PERMISSIONS = [
  'manage_users',
  'manage_content',
  'view_analytics',
  'system_settings',
  'manage_courses',
  'manage_lessons'
];

const TEACHER_PERMISSIONS = [
  'manage_content',
  'view_analytics',
  'manage_courses',
  'manage_lessons'
];

export function useInterfaceAuth(): InterfaceAuthHook {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    hasAdminAccess: false,
    hasTeacherAccess: false
  });

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const userData = JSON.parse(stored);
          const user = await validateStoredUser(userData);
          if (user) {
            updateAuthState(user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const validateStoredUser = async (userData: any): Promise<User | null> => {
    // In a real app, validate the token with the server
    // For now, just check if the data structure is valid
    if (userData && userData.id && userData.email && userData.role) {
      return userData;
    }
    return null;
  };

  const updateAuthState = useCallback((user: User | null) => {
    const hasAdminAccess = user?.role === 'admin';
    const hasTeacherAccess = user?.role === 'admin' || user?.role === 'teacher';

    setAuth({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      hasAdminAccess,
      hasTeacherAccess
    });

    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setAuth(prev => ({ ...prev, isLoading: true }));

    try {
      // Mock login - replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        fullName: email === 'admin@turkishlearning.com' ? 'Admin User' : 'Teacher User',
        role: email === 'admin@turkishlearning.com' ? 'admin' : 'teacher',
        profileImage: undefined,
        permissions: email === 'admin@turkishlearning.com' ? ADMIN_PERMISSIONS : TEACHER_PERMISSIONS,
        preferences: {
          language: 'en',
          theme: 'system',
          notifications: true
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateAuthState(mockUser);
      toast.success('Logged in successfully');
    } catch (error) {
      setAuth(prev => ({ ...prev, isLoading: false }));
      toast.error('Login failed');
      throw error;
    }
  }, [updateAuthState]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout API
      updateAuthState(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
      throw error;
    }
  }, [updateAuthState]);

  const switchInterface = useCallback((targetInterface: 'admin' | 'user') => {
    const { hasAdminAccess, hasTeacherAccess } = auth;

    if (targetInterface === 'admin' && !hasAdminAccess && !hasTeacherAccess) {
      toast.error('You do not have permission to access the admin interface');
      return;
    }

    const urls = {
      admin: 'http://localhost:3003',
      user: 'http://localhost:3000'
    };

    // Open in new tab to preserve current session
    window.open(urls[targetInterface], '_blank');
    toast.success(`Opening ${targetInterface} interface in new tab`);
  }, [auth]);

  const checkPermission = useCallback((permission: string): boolean => {
    return auth.user?.permissions.includes(permission) || false;
  }, [auth.user]);

  const updateUser = useCallback(async (updates: Partial<User>): Promise<void> => {
    if (!auth.user) {
      throw new Error('No user logged in');
    }

    try {
      // Call update API
      const updatedUser = { ...auth.user, ...updates };
      updateAuthState(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
      throw error;
    }
  }, [auth.user, updateAuthState]);

  return {
    auth,
    login,
    logout,
    switchInterface,
    checkPermission,
    updateUser
  };
}

// Helper hook for role-based access control
export function useRoleAccess() {
  const { auth, checkPermission } = useInterfaceAuth();

  return {
    isAdmin: auth.hasAdminAccess,
    isTeacher: auth.hasTeacherAccess,
    isStudent: auth.user?.role === 'student',
    canManageUsers: checkPermission('manage_users'),
    canManageContent: checkPermission('manage_content'),
    canViewAnalytics: checkPermission('view_analytics'),
    canManageSystem: checkPermission('system_settings'),
    checkPermission
  };
}
