'use client';

import { useState, useEffect } from 'react';
import { Save, Shield, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setName(data.user?.name || '');
        setEmail(data.user?.email || '');
        setSessions(data.sessions || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function saveProfile() {
    setMessage('');
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).catch(() => null);
    setMessage(res?.ok ? 'تم الحفظ' : 'تعذّر الحفظ (قاعدة البيانات غير متصلة)');
  }

  async function revokeSession(sessionId: string) {
    await fetch(`/api/user?sessionId=${sessionId}`, { method: 'DELETE' }).catch(() => {});
    loadSettings();
  }

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-blue-700" />
          <h2 className="text-lg font-semibold">الملف الشخصي</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">الاسم</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" dir="rtl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input value={email} disabled className="input-field bg-gray-50" dir="ltr" />
          </div>
          {message && <p className="text-sm text-gray-600">{message}</p>}
          <button onClick={saveProfile} className="btn-primary px-4 py-2">
            <Save className="h-4 w-4 inline ml-1" /> حفظ
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-blue-700" />
          <h2 className="text-lg font-semibold">الأمان</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">جلسات نشطة</p>
              <p className="text-sm text-gray-500">{sessions.length} جهاز متصل</p>
            </div>
          </div>
          {sessions.length > 0 && (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{s.userAgent || 'جهاز غير معروف'}</p>
                    <p className="text-xs text-gray-500">
                      {s.ip ? `IP: ${s.ip}` : ''} · {new Date(s.createdAt).toLocaleString('ar-IQ')}
                    </p>
                  </div>
                  <button onClick={() => revokeSession(s.id)} className="btn-ghost text-red-600 text-sm">
                    إنهاء
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-blue-700" />
          <h2 className="text-lg font-semibold">الإشعارات</h2>
        </div>
        <p className="text-gray-500">إعدادات الإشعارات قيد التطوير</p>
      </div>

      <div className="card p-6 border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">منطقة الخطر</h2>
        <p className="text-sm text-gray-600 mb-4">حذف حسابك سيؤدي إلى حذف جميع بياناتك خلال 30 يوماً</p>
        <button className="btn-danger px-4 py-2" onClick={() => alert('وظيفة حذف الحساب قيد التطوير')}>
          حذف الحساب
        </button>
      </div>
    </div>
  );
}