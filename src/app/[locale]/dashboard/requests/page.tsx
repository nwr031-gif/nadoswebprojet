'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const serviceTypes = [
  { value: 'web_dev', label: 'تطوير المواقع والتطبيقات' },
  { value: 'mobile_dev', label: 'تطوير تطبيقات موبايل' },
  { value: 'engineering', label: 'هندسة' },
  { value: 'market_analysis', label: 'تحليل الأسواق' },
  { value: 'education', label: 'تعليم' },
  { value: 'business_solutions', label: 'حلول الأعمال' },
  { value: 'custom', label: 'حلول مخصصة' },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ serviceType: 'web_dev', title: '', description: '', budget: '', deadline: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadRequests(); }, []);

  async function loadRequests() {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) setRequests(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType: form.serviceType,
        title: form.title,
        description: form.description,
        budget: form.budget ? parseInt(form.budget) : null,
        deadline: form.deadline || null,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ serviceType: 'web_dev', title: '', description: '', budget: '', deadline: '' });
      loadRequests();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'تعذّر إرسال الطلب (قاعدة البيانات غير متصلة)');
    }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    submitted: { label: 'مقدم', color: 'bg-gray-100 text-gray-700', icon: Clock },
    under_review: { label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-700', icon: Clock },
    accepted: { label: 'مقبول', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: XCircle },
    needs_info: { label: 'يحتاج معلومات', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">طلبات الخدمة</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2 px-4 py-2">
          <Plus className="h-4 w-4" /> طلب جديد
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">طلب خدمة جديد</h2>
          <form onSubmit={submitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">نوع الخدمة</label>
              <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="input-field">
                {serviceTypes.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العنوان (5-150 حرفاً)</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="عنوان الطلب" required minLength={5} maxLength={150} dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوصف (50-2000 حرف)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[100px]" placeholder="صف طلبك بالتفصيل..." required minLength={50} maxLength={2000} dir="rtl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الميزانية (د.ع) — اختياري</label>
                <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="input-field" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الموعد النهائي — اختياري</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" />
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary px-6 py-2">إرسال الطلب</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-6 py-2">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p>جاري التحميل...</p> : (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500">لا توجد طلبات</p>
            </div>
          ) : (
            requests.map((req) => {
              const status = statusConfig[req.status] || statusConfig.submitted;
              return (
                <div key={req.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{req.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {serviceTypes.find((s) => s.value === req.serviceType)?.label}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>رقم الطلب: {req.id}</span>
                    {req.budget && <span>الميزانية: {req.budget} د.ع</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}