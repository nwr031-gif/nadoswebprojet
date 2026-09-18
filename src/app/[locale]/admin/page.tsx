'use client';

import { useEffect, useState } from 'react';
import { Users, FolderOpen, ClipboardList, AlertTriangle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, projects: 0, requests: 0, banned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setStats({
            users: Array.isArray(d.users) ? d.users.length : 0,
            projects: Array.isArray(d.projects) ? d.projects.length : 0,
            requests: Array.isArray(d.requests) ? d.requests.length : 0,
            banned: Array.isArray(d.users) ? d.users.filter((u: any) => u.banned).length : 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: 'المستخدمون', value: stats.users, icon: Users },
    { title: 'المشاريع', value: stats.projects, icon: FolderOpen },
    { title: 'الطلبات', value: stats.requests, icon: ClipboardList },
    { title: 'محظورون', value: stats.banned, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة المدير</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <c.icon className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{c.title}</p>
                <p className="text-2xl font-bold">{loading ? '-' : c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">إدارة المستخدمين</h2>
          <p className="text-gray-500">إدارة المستخدمين والصلاحيات قيد التطوير</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">إدارة الطلبات</h2>
          <p className="text-gray-500">مراجعة والرد على الطلبات قيد التطوير</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">سجل التدقيق</h2>
          <p className="text-gray-500">سجل التدقيق قيد التطوير</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">إدارة الموارد</h2>
          <p className="text-gray-500">إدارة الموارد قيد التطوير</p>
        </div>
      </div>
    </div>
  );
}