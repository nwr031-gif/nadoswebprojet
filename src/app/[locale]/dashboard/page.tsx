'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FolderOpen, FileText, Activity, Clock } from 'lucide-react';

export default function DashboardIndexPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مرحباً بك في لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">إليك ملخص مشاريعك</p>
        </div>
        <Link href="/ar/dashboard/projects" className="btn-primary inline-flex items-center gap-2 px-4 py-2">
          <Plus className="h-4 w-4" /> مشروع جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="المشاريع" value={projects.length} icon={FolderOpen} />
        <StatCard title="الملفات" value={0} icon={FileText} />
        <StatCard title="الطلبات" value={0} icon={Activity} />
        <StatCard title="آخر نشاط" value="-" icon={Clock} />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">مشاريعك الأخيرة</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">لا توجد مشاريع بعد</p>
            <Link href="/ar/dashboard/projects" className="btn-primary px-4 py-2">
              أنشئ مشروعك الأول
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 10).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Link href={`/ar/dashboard/projects/${project.id}`} className="font-medium text-blue-700 hover:underline">
                  {project.name}
                </Link>
                <span className="text-sm text-gray-500 capitalize">{project.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: any; icon: any }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}