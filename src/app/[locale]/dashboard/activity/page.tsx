'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activity')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setActivities(Array.isArray(d) ? d : []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">سجل النشاط</h1>
      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div className="card p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">لا يوجد نشاط بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-blue-700" />
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