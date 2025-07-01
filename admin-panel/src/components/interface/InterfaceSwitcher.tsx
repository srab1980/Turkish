'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowsRightLeftIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

interface InterfaceMode {
  mode: 'admin' | 'user';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  url: string;
  openInNewTab?: boolean;
}

interface InterfaceSwitcherProps {
  currentInterface: 'admin' | 'user';
  onInterfaceChange?: (mode: 'admin' | 'user') => void;
  className?: string;
  compact?: boolean;
}

export default function InterfaceSwitcher({
  currentInterface,
  onInterfaceChange,
  className = '',
  compact = false
}: InterfaceSwitcherProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const interfaceModes: InterfaceMode[] = [
    {
      mode: 'admin',
      label: 'Admin Interface',
      icon: Cog6ToothIcon,
      description: 'Manage content, users, and system settings',
      url: 'http://localhost:3003',
      openInNewTab: false
    },
    {
      mode: 'user',
      label: 'Student Interface',
      icon: AcademicCapIcon,
      description: 'Experience the app as a student would',
      url: 'http://localhost:3000',
      openInNewTab: true
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInterfaceSwitch = (mode: InterfaceMode) => {
    setShowMenu(false);
    
    if (mode.mode === currentInterface) {
      return;
    }

    if (mode.openInNewTab) {
      window.open(mode.url, '_blank');
      toast.success(`Opening ${mode.label} in new tab`);
    } else {
      window.location.href = mode.url;
    }

    onInterfaceChange?.(mode.mode);
  };

  const currentMode = interfaceModes.find(mode => mode.mode === currentInterface);

  return (
    <div className={clsx('relative', className)} ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={clsx(
          'flex items-center space-x-2 rounded-lg p-2 text-secondary-600 hover:bg-secondary-100 hover:text-secondary-800 transition-colors',
          compact && 'p-1.5'
        )}
        title="Switch Interface"
      >
        <ArrowsRightLeftIcon className={clsx('h-5 w-5', compact && 'h-4 w-4')} />
        {!compact && (
          <>
            <span className="hidden sm:block text-sm font-medium">
              {currentMode?.label.split(' ')[0] || 'Interface'}
            </span>
            <ChevronDownIcon className="h-4 w-4" />
          </>
        )}
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 z-50 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-secondary-900">Switch Interface</h3>
                <div className="flex items-center text-xs text-secondary-500">
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
                      onClick={() => handleInterfaceSwitch(mode)}
                      className={clsx(
                        'w-full flex items-start space-x-3 rounded-lg p-3 text-left transition-all duration-200',
                        isActive
                          ? 'bg-primary-50 border border-primary-200 text-primary-700 shadow-sm'
                          : 'hover:bg-secondary-50 border border-transparent hover:border-secondary-200'
                      )}
                    >
                      <Icon className={clsx(
                        'h-5 w-5 mt-0.5 flex-shrink-0',
                        isActive ? 'text-primary-600' : 'text-secondary-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className={clsx(
                            'text-sm font-medium',
                            isActive ? 'text-primary-900' : 'text-secondary-900'
                          )}>
                            {mode.label}
                          </div>
                          {mode.openInNewTab && (
                            <ArrowTopRightOnSquareIcon className="h-3 w-3 text-secondary-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className={clsx(
                          'text-xs mt-1',
                          isActive ? 'text-primary-600' : 'text-secondary-500'
                        )}>
                          {mode.description}
                        </div>
                        {isActive && (
                          <div className="mt-2">
                            <span className="inline-flex items-center text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-1.5"></div>
                              Currently Active
                            </span>
                          </div>
                        )}
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
  );
}
