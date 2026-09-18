'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession, SessionProvider } from 'next-auth/react';
import {
  LayoutDashboard, FolderOpen, FileText, ClipboardList, Activity,
  Globe, Settings, Shield, HelpCircle, LogOut, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { name: 'المشاريع', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'الملفات', href: '/dashboard/files', icon: FileText },
  { name: 'الطلبات', href: '/dashboard/requests', icon: ClipboardList },
  { name: 'النشاط', href: '/dashboard/activity', icon: Activity },
  { name: 'المعرض', href: '/showcase', icon: Globe },
  { name: 'الموارد', href: '/dashboard/resources', icon: HelpCircle },
  { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'admin';
  const allNav = isAdmin ? [{ name: 'لوحة المدير', href: '/admin', icon: Shield }, ...navItems] : navItems;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-md hover:bg-gray-100">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/ar/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">NADOS</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/ar/dashboard/settings" className="text-sm text-gray-600 hover:text-gray-900">
            {session?.user?.name || 'حسابي'}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/ar/auth/signin' })}
            className="btn-ghost p-2 text-gray-600 hover:text-red-600"
            title="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-30 w-64 bg-white border-l transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto',
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="sticky top-16 pt-4 pb-4 px-3 h-full overflow-y-auto">
            <nav className="space-y-1">
              {allNav.map((item) => {
                const active = pathname.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={`/ar${item.href}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-64px)] p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Shell>{children}</Shell>
    </SessionProvider>
  );
}