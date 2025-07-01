'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { User } from '@/types';
import apiClient from '@/lib/api';

interface HeaderProps {
  user?: User;
  onUserUpdate?: (user: User) => void;
}

interface InterfaceMode {
  mode: 'admin' | 'user';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

export default function Header({ user, onUserUpdate }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInterfaceMenu, setShowInterfaceMenu] = useState(false);
  const [currentInterface, setCurrentInterface] = useState<'admin' | 'user'>('admin');
  const [notifications] = useState([
    {
      id: '1',
      title: 'New course published',
      message: 'Turkish Grammar Basics has been published',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: '2',
      title: 'User registration spike',
      message: '50 new users registered today',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: '3',
      title: 'System maintenance',
      message: 'Scheduled maintenance completed',
      time: '3 hours ago',
      unread: false,
    },
  ]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const interfaceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (interfaceMenuRef.current && !interfaceMenuRef.current.contains(event.target as Node)) {
        setShowInterfaceMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const interfaceModes: InterfaceMode[] = [
    {
      mode: 'admin',
      label: 'Admin Interface',
      icon: Cog6ToothIcon,
      description: 'Manage content, users, and system settings'
    },
    {
      mode: 'user',
      label: 'Student Interface',
      icon: AcademicCapIcon,
      description: 'Experience the app as a student'
    }
  ];

  const handleInterfaceSwitch = (mode: 'admin' | 'user') => {
    setCurrentInterface(mode);
    setShowInterfaceMenu(false);

    if (mode === 'user') {
      // Navigate directly to student interface
      window.location.href = 'http://localhost:3001';
    } else {
      toast.success('Switched to admin interface');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="border-b border-secondary-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search */}
        <div className="flex flex-1 items-center">
          <form onSubmit={handleSearch} className="w-full max-w-lg">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, lessons, users..."
                className="block w-full rounded-lg border border-secondary-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-secondary-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Interface Switcher */}
          <div className="relative" ref={interfaceMenuRef}>
            <button
              onClick={() => setShowInterfaceMenu(!showInterfaceMenu)}
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 transition-colors border border-secondary-200 hover:border-secondary-300"
              title="Switch Interface"
            >
              <ArrowsRightLeftIcon className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium">
                {currentInterface === 'admin' ? 'Admin View' : 'Student View'}
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showInterfaceMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 z-50 mt-2 w-80 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-10 border border-secondary-200"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-secondary-900">Switch Interface</h3>
                      <div className="flex items-center text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded-full">
                        <EyeIcon className="h-3 w-3 mr-1" />
                        Preview Mode
                      </div>
                    </div>
                    <div className="space-y-3">
                      {interfaceModes.map((mode) => {
                        const Icon = mode.icon;
                        const isActive = currentInterface === mode.mode;

                        return (
                          <button
                            key={mode.mode}
                            onClick={() => handleInterfaceSwitch(mode.mode)}
                            className={clsx(
                              'w-full flex items-start space-x-3 rounded-lg p-4 text-left transition-all duration-200 group',
                              isActive
                                ? 'bg-primary-50 border border-primary-200 text-primary-700 shadow-sm'
                                : 'hover:bg-secondary-50 border border-secondary-200 hover:border-primary-200 hover:shadow-sm'
                            )}
                          >
                            <Icon className={clsx(
                              'h-5 w-5 mt-0.5',
                              isActive ? 'text-primary-600' : 'text-secondary-400'
                            )} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className={clsx(
                                  'text-sm font-medium',
                                  isActive ? 'text-primary-900' : 'text-secondary-900'
                                )}>
                                  {mode.label}
                                  {isActive && (
                                    <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>
                                {mode.mode === 'user' && (
                                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-secondary-400 group-hover:text-primary-500" />
                                )}
                              </div>
                              <div className={clsx(
                                'text-xs mt-1',
                                isActive ? 'text-primary-600' : 'text-secondary-500'
                              )}>
                                {mode.description}
                                {mode.mode === 'user' && (
                                  <span className="block mt-1 text-xs text-secondary-400">
                                    Switches to student interface
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-secondary-100">
                      <div className="text-xs text-secondary-500">
                        <div className="flex items-center space-x-1">
                          <span>💡</span>
                          <span>Switch between interfaces to test different user experiences</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 z-50 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-secondary-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-sm text-secondary-500">{unreadCount} unread</span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={clsx(
                          'border-t border-secondary-100 p-4 hover:bg-secondary-50',
                          notification.unread && 'bg-primary-50'
                        )}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-secondary-900">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-secondary-600">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-secondary-500">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="ml-2 h-2 w-2 rounded-full bg-primary-600"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-secondary-100 p-4">
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 rounded-lg p-2 text-sm hover:bg-secondary-100"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-secondary-400" />
              )}
              <div className="hidden text-left md:block">
                <div className="font-medium text-secondary-900">
                  {user?.fullName || 'Admin User'}
                </div>
                <div className="text-secondary-500">{user?.role || 'Administrator'}</div>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-secondary-400" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-secondary-100">
                      <p className="text-sm font-medium text-secondary-900">
                        {user?.fullName || 'Admin User'}
                      </p>
                      <p className="text-sm text-secondary-500">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/profile');
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-secondary-400" />
                      Profile Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/system/config');
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-secondary-400" />
                      System Settings
                    </button>
                    
                    <div className="border-t border-secondary-100">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-error-700 hover:bg-error-50"
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-error-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
