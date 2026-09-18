'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Eye, Trash2, FolderOpen } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', category: 'thesis', templateId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [projRes, tplRes] = await Promise.all([
        fetch('/api/projects').catch(() => null),
        fetch('/api/templates').catch(() => null),
      ]);
      if (projRes?.ok) {
        const d = await projRes.json();
        setProjects(Array.isArray(d) ? d : []);
      }
      if (tplRes?.ok) {
        const d = await tplRes.json();
        setTemplatesList(Array.isArray(d) ? d : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProject.name,
        category: newProject.category,
        templateId: newProject.templateId || null,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewProject({ name: '', category: 'thesis', templateId: '' });
      loadData();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'تعذّر إنشاء المشروع (قاعدة البيانات غير متصلة)');
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' }).catch(() => {});
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المشاريع</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2 px-4 py-2">
          <Plus className="h-4 w-4" /> مشروع جديد
        </button>
      </div>

      {showCreate && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">إنشاء مشروع جديد</h2>
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المشروع</label>
              <input
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="input-field"
                placeholder="أدخل اسم المشروع"
                required
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">التصنيف</label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  className="input-field"
                >
                  <option value="thesis">أطروحة تخرج</option>
                  <option value="portfolio">معرض أعمال</option>
                  <option value="engineering">مشروع هندسي</option>
                  <option value="business_plan">خطة عمل</option>
                  <option value="market_research">بحث سوق</option>
                  <option value="course">دورة تدريبية</option>
                  <option value="custom">مخصص</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">القالب (اختياري)</label>
                <select
                  value={newProject.templateId}
                  onChange={(e) => setNewProject({ ...newProject, templateId: e.target.value })}
                  className="input-field"
                >
                  <option value="">بدون قالب</option>
                  {templatesList.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary px-6 py-2">إنشاء</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-outline px-6 py-2">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>جاري التحميل...</p>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">لا توجد مشاريع بعد</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary px-4 py-2">
            أنشئ مشروعك الأول
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <div className="flex gap-1">
                  <Link href={`/ar/dashboard/projects/${project.id}`} className="btn-ghost p-1.5">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button onClick={() => deleteProject(project.id)} className="btn-ghost p-1.5 text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3 capitalize">{project.category}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                  project.status === 'active' ? 'bg-blue-100 text-blue-700' :
                  project.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                  project.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {project.status}
                </span>
                <span className="text-sm text-gray-500">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-700 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}