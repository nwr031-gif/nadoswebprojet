'use client';

import { Upload } from 'lucide-react';

export default function FilesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الملفات</h1>
      <div className="card p-12 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">صفحة الملفات - اختر مشروعاً لعرض ملفاته</p>
        <div className="bg-gray-50 p-6 rounded-lg text-right" dir="rtl">
          <h3 className="font-medium mb-2">أنواع الملفات المدعومة:</h3>
          <p className="text-sm text-gray-600">JPG, PNG, WebP, PDF, DOCX, ZIP</p>
          <h3 className="font-medium mb-2 mt-4">الحدود:</h3>
          <p className="text-sm text-gray-600">25 ميجابايت لكل ملف · 10 ملفات لكل مشروع · 500 ميجابايت لكل مستخدم</p>
        </div>
      </div>
    </div>
  );
}