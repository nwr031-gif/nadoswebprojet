'use client';

import { useState } from 'react';
import { Search, FileText } from 'lucide-react';

export default function ResourcesPage() {
  const [articles] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const filtered = articles.filter((a) => a.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">مكتبة الموارد</h1>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في الموارد..."
          className="input-field pr-10"
          dir="rtl"
        />
      </div>

      <div className="card p-8 text-center">
        <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <p className="text-gray-500">لا توجد مقالات منشورة بعد — ستنشر الإدارة الموارد هنا</p>
      </div>
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article) => (
            <div key={article.id} className="card p-5">
              <h3 className="font-semibold mb-2">{article.title}</h3>
              <p className="text-sm text-gray-500">{article.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}