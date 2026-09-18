'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Upload, MessageSquare, ClipboardList, History, Settings, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'files' | 'notes' | 'requests' | 'activity';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.projectId as string;
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [newNote, setNewNote] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  async function loadProject() {
    try {
      const [projRes, filesRes, notesRes, activityRes] = await Promise.all([
        fetch(`/api/projects/${id}`).catch(() => null),
        fetch(`/api/projects/${id}/files`).catch(() => null),
        fetch(`/api/projects/${id}/notes`).catch(() => null),
        fetch(`/api/projects/${id}/activity`).catch(() => null),
      ]);
      if (projRes?.ok) {
        const p = await projRes.json();
        setProject(p);
        setProgress(p.progress || 0);
      }
      if (filesRes?.ok) setFiles(await filesRes.json());
      if (notesRes?.ok) setNotes(await notesRes.json());
      if (activityRes?.ok) setActivities(await activityRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateProgress() {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    }).catch(() => {});
    loadProject();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    await fetch(`/api/projects/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    }).catch(() => {});
    setNewNote('');
    loadProject();
  }

  async function changeStatus(status: string) {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    loadProject();
  }

  if (loading) return <div className="p-8">جاري التحميل...</div>;
  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">تعذّر تحميل المشروع (قاعدة البيانات غير متصلة أو المشروع غير موجود)</p>
        <Link href="/ar/dashboard/projects" className="btn-primary inline-block mt-4 px-4 py-2">
          العودة للمشاريع
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: Settings },
    { key: 'files', label: 'الملفات', icon: Upload },
    { key: 'notes', label: 'الملاحظات', icon: MessageSquare },
    { key: 'requests', label: 'طلبات الخدمة', icon: ClipboardList },
    { key: 'activity', label: 'النشاط', icon: History },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ar/dashboard/projects" className="btn-ghost p-2">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-500 capitalize">{project.category} · {project.status}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <select value={project.status} onChange={(e) => changeStatus(e.target.value)} className="input-field max-w-[200px]">
            <option value="draft">مسودة</option>
            <option value="active">نشط</option>
            <option value="review">مراجعة</option>
            <option value="delivered">تم التسليم</option>
            <option value="archived">أرشيف</option>
          </select>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-sm mb-1">
              <span>التقدم</span>
              <span>{progress}%</span>
            </div>
            <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full" />
            <button onClick={updateProgress} className="btn-outline text-sm mt-2 px-3 py-1">
              <Save className="h-3 w-3 inline ml-1" /> حفظ التقدم
            </button>
          </div>
        </div>
      </div>

      <div className="border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.key ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">نظرة عامة</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">الاسم</p><p className="font-medium">{project.name}</p></div>
            <div><p className="text-sm text-gray-500">التصنيف</p><p className="font-medium capitalize">{project.category}</p></div>
            <div><p className="text-sm text-gray-500">الحالة</p><p className="font-medium capitalize">{project.status}</p></div>
            <div><p className="text-sm text-gray-500">الملفات</p><p className="font-medium">{files.length} ملف</p></div>
            <div><p className="text-sm text-gray-500">الملاحظات</p><p className="font-medium">{notes.length} ملاحظة</p></div>
            <div><p className="text-sm text-gray-500">الأنشطة</p><p className="font-medium">{activities.length} نشاط</p></div>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">الملفات</h2>
            <span className="text-sm text-gray-500">{files.length} / 10 ملفات</span>
          </div>
          {files.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">ارفع أول ملف</p>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP, PDF, DOCX, ZIP · حتى 25 ميجابايت</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.mimeType} · {file.size} بايت</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    file.scanStatus === 'clean' ? 'bg-green-100 text-green-700' :
                    file.scanStatus === 'infected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {file.scanStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">الملاحظات</h2>
          <form onSubmit={addNote} className="mb-6">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="أضف ملاحظة..."
              dir="rtl"
            />
            <button type="submit" className="btn-primary mt-2 px-4 py-2">إضافة</button>
          </form>
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm" dir="rtl">{note.content}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(note.createdAt).toLocaleDateString('ar-IQ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">طلبات الخدمة</h2>
          <p className="text-gray-500">لا توجد طلبات مرتبطة بهذا المشروع</p>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">النشاط</h2>
          {activities.length === 0 ? (
            <p className="text-gray-500">لا يوجد نشاط</p>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 text-xs font-bold">{a.action[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString('ar-IQ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}