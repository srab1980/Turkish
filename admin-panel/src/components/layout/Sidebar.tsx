'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BeakerIcon,
  CloudArrowUpIcon,
  FlagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: SidebarItem[];
}

const navigation: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Content Management',
    href: '/content',
    icon: BookOpenIcon,
    children: [
      { name: 'Curriculum', href: '/content/curriculum', icon: AcademicCapIcon },
      { name: 'Courses', href: '/content/courses', icon: AcademicCapIcon },
      { name: 'Lessons', href: '/content/lessons', icon: DocumentTextIcon },
      { name: 'Exercises', href: '/content/exercises', icon: BeakerIcon },
      { name: 'Vocabulary', href: '/content/vocabulary', icon: BookOpenIcon },
      { name: 'Grammar', href: '/content/grammar', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'User Management',
    href: '/users',
    icon: UserGroupIcon,
  },
  {
    name: 'Analytics & Reports',
    href: '/analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'AI Tools',
    href: '/ai-tools',
    icon: BeakerIcon,
    children: [
      { name: 'Content Import', href: '/ai-tools/import', icon: CloudArrowUpIcon },
      { name: 'Exercise Generator', href: '/ai-tools/exercises', icon: BeakerIcon },
      { name: 'Content Review', href: '/ai-tools/review', icon: DocumentTextIcon },
    ],
  },
  {
    name: 'System',
    href: '/system',
    icon: CogIcon,
    children: [
      { name: 'Configuration', href: '/system/config', icon: CogIcon },
      { name: 'Feature Flags', href: '/system/features', icon: FlagIcon },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (href: string) => expandedItems.includes(href);

  const renderNavItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);
    const expanded = isExpanded(item.href);

    return (
      <div key={item.href}>
        <div
          className={clsx(
            'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
            level > 0 && 'ml-4',
            active
              ? 'bg-primary-100 text-primary-700 shadow-sm'
              : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900',
            collapsed && level === 0 && 'justify-center px-2'
          )}
        >
          {hasChildren && !collapsed ? (
            <button
              onClick={() => toggleExpanded(item.href)}
              className="flex w-full items-center"
            >
              <item.icon
                className={clsx(
                  'h-5 w-5 flex-shrink-0',
                  active ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && (
                <ChevronRightIcon
                  className={clsx(
                    'ml-auto h-4 w-4 transition-transform duration-200',
                    expanded && 'rotate-90'
                  )}
                />
              )}
            </button>
          ) : (
            <Link href={item.href} className="flex w-full items-center">
              <item.icon
                className={clsx(
                  'h-5 w-5 flex-shrink-0',
                  active ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !collapsed && (
                <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600">
                  {item.badge}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && expanded && !collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 space-y-1"
            >
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex h-full flex-col border-r border-secondary-200 bg-white"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-secondary-200 px-4">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-secondary-900">
                Turkish Admin
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map(item => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="border-t border-secondary-200 p-4">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-secondary-500"
            >
              <div>Turkish Learning Admin</div>
              <div>Version 1.0.0</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
