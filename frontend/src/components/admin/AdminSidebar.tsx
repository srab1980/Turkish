'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Content Management', href: '/admin/content', icon: '📚' },
  { name: 'Curriculum', href: '/admin/content/curriculum', icon: '📖' },
  { name: 'Courses', href: '/admin/content/courses', icon: '🎓' },
  { name: 'Lessons', href: '/admin/content/lessons', icon: '📝' },
  { name: 'Exercises', href: '/admin/content/exercises', icon: '🎯' },
  { name: 'Exams', href: '/admin/content/exams', icon: '📝' },
  { name: 'Vocabulary', href: '/admin/content/vocabulary', icon: '📚' },
  { name: 'Grammar', href: '/admin/content/grammar', icon: '📝' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
