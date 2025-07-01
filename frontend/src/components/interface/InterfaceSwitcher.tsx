'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftRight,
  ChevronDown,
  GraduationCap,
  Shield,
  ExternalLink,
  Eye
} from 'lucide-react';

interface InterfaceMode {
  mode: 'user' | 'admin';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  url: string;
  openInNewTab?: boolean;
}

interface InterfaceSwitcherProps {
  currentInterface: 'user' | 'admin';
  onInterfaceChange?: (mode: 'user' | 'admin') => void;
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
      mode: 'user',
      label: 'Student Interface',
      icon: GraduationCap,
      description: 'Learn Turkish with interactive lessons and exercises',
      url: 'http://localhost:3000',
      openInNewTab: false
    },
    {
      mode: 'admin',
      label: 'Admin Interface',
      icon: Shield,
      description: 'Manage content, users, analytics, and system settings',
      url: 'http://localhost:3003',
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
    } else {
      window.location.href = mode.url;
    }

    onInterfaceChange?.(mode.mode);
  };

  const currentMode = interfaceModes.find(mode => mode.mode === currentInterface);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button
        variant="ghost"
        size={compact ? "sm" : "default"}
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2"
      >
        <ArrowLeftRight className={compact ? "h-3 w-3" : "h-4 w-4"} />
        {!compact && (
          <>
            <span className="hidden lg:block text-sm">
              {currentMode?.label.split(' ')[0] || 'Interface'}
            </span>
            <ChevronDown className="h-3 w-3" />
          </>
        )}
      </Button>

      {showMenu && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg bg-background border shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Switch Interface</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <Eye className="h-3 w-3 mr-1" />
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
                    className={`w-full flex items-start space-x-3 rounded-lg p-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                        : 'hover:bg-muted border border-transparent hover:border-border'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-primary' : 'text-foreground'
                        }`}>
                          {mode.label}
                        </div>
                        {mode.openInNewTab && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isActive ? 'text-primary/70' : 'text-muted-foreground'
                      }`}>
                        {mode.description}
                      </div>
                      {isActive && (
                        <div className="mt-2">
                          <span className="inline-flex items-center text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></div>
                            Currently Active
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span>💡</span>
                  <span>Switch between interfaces to experience different user roles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
