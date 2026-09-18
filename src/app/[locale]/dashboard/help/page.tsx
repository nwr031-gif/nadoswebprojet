'use client';

import { Mail, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">المساعدة</h1>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">أسئلة شائعة</h2>
        <div className="space-y-4">
          <details className="group">
            <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
              كيف أبدأ؟
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-gray-600 mt-2">أنشئ حساباً، اختر قالباً أو أنشئ مشروعاً من الصفر، ثم ابدأ بالعمل.</p>
          </details>
          <details className="group">
            <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
              ما هي الملفات المدعومة؟
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-gray-600 mt-2">JPG, PNG, WebP, PDF, DOCX, ZIP بحد أقصى 25 ميجابايت لكل ملف.</p>
          </details>
          <details className="group">
            <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
              كيف أنشر مشروعاً في المعرض؟
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="text-gray-600 mt-2">من إعدادات المشروع، فعّل خيار "نشر في المعرض". سيتم فحص المشروع قبل النشر.</p>
          </details>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">تواصل معنا</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-700" />
            <span>info@nados.iq</span>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-blue-700" />
            <span>دردشة مباشرة (قريباً)</span>
          </div>
        </div>
      </div>
    </div>
  );
}