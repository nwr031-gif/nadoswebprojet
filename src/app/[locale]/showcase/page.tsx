'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Globe, FolderOpen } from 'lucide-react';

export default function ShowcasePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    try {
      const res = await fetch('/api/showcase');
      if (res.ok) setProjects(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const categories = [...new Set(projects.map((p) => p.category))];

  const filtered = projects.filter((p) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">معرض الأعمال</h1>
        <p className="text-gray-600 mt-2">استعرض المشاريع المنشورة من قبل مجتمع نادوس</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المشاريع..."
            className="input-field pr-10"
            dir="rtl"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field"
        >
          <option value="">جميع التصنيفات</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? <p className="text-center">جاري التحميل...</p> : (
        filtered.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">لا توجد مشاريع عامة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <div key={project.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">عام</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">{project.category}</span>
                  <span className="text-sm text-gray-500">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}