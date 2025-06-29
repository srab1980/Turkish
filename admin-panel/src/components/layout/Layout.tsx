'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { User } from '@/types';
import apiClient from '@/lib/api';

interface LayoutProps {
  children: React.ReactNode;
}



export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In development mode, create a mock user if backend is not available
        if (process.env.NODE_ENV === 'development') {
          try {
            const response = await apiClient.getCurrentUser();
            if (response.success && response.data) {
              setUser(response.data);
            } else {
              // Create mock user for development
              setUser({
                id: 'dev-user-1',
                email: 'admin@turkishlearning.com',
                fullName: 'Admin User',
                role: 'ADMIN',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          } catch (error) {
            // Backend not available, use mock user for development
            setUser({
              id: 'dev-user-1',
              email: 'admin@turkishlearning.com',
              fullName: 'Admin User',
              role: 'ADMIN',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } else {
          // Production mode - require real authentication
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            router.push('/login');
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'development') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} onUserUpdate={setUser} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
