import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Users, FileText, Settings } from 'lucide-react';

const services = [
  { title: 'تطوير المواقع والتطبيقات', desc: 'بناء مواقع وتطبيقات حديثة بمعايير عالية الجودة', icon: Globe },
  { title: 'الهندسة', desc: 'مخططات هندسية وتصميمات تقنية احترافية', icon: Settings },
  { title: 'تحليل الأسواق', desc: 'دراسات جدوى وتحليلات سوقية دقيقة', icon: Users },
  { title: 'التعليم', desc: 'محتوى تعليمي ودورات متخصصة', icon: FileText },
  { title: 'حلول الأعمال', desc: 'أنظمة إدارة وأتمتة العمليات', icon: Zap },
  { title: 'الحلول المخصصة', desc: 'حلول مصممة حسب احتياجاتك', icon: Shield },
];

const howItems = [
  { step: '1', title: 'أنشئ حسابك', desc: 'سجّل في دقائق مجاناً' },
  { step: '2', title: 'ابدأ مشروعاً', desc: 'من قالب جاهز أو من الصفر' },
  { step: '3', title: 'نظّم وارفع', desc: 'ملفاتك وملاحظاتك في مكان واحد' },
  { step: '4', title: 'أنجز وشارك', desc: 'تابع التقدم وانشر في المعرض' },
];

const templates = [
  { name: 'أطروحة تخرج', category: 'القالب الأكاديمي' },
  { name: 'معرض أعمال', category: 'القالب الاحترافي' },
  { name: 'مشروع هندسي', category: 'القالب الهندسي' },
  { name: 'خطة عمل', category: 'قالب الأعمال' },
  { name: 'بحث سوق', category: 'القالب التحليلي' },
  { name: 'دورة تدريبية', category: 'القالب التعليمي' },
  { name: 'مخصص', category: 'قالب حر' },
  { name: 'آخر', category: 'قالب إضافي' },
];

export default function HomePage() {
  return (
    <div dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              من أرض الحضارة... <span className="text-blue-900">نصنع مستقبل التكنولوجيا</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              منصة تقنية عراقية تجمع خدماتك الرقمية في منظومة واحدة. ابدأ مجاناً وأدِر مشاريعك من الفكرة حتى التسليم.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ar/auth/signup" className="btn-primary px-8 py-3 text-lg">
                ابدأ مجاناً
              </Link>
              <Link href="/ar/showcase" className="btn-outline px-8 py-3 text-lg">
                استعرض المشاريع
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">خدماتنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s) => (
              <div key={s.title} className="card p-6 hover:shadow-md transition-shadow">
                <s.icon className="h-10 w-10 text-blue-900 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">كيف تعمل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItems.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto h-12 w-12 bg-blue-900 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">قوالب جاهزة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((t) => (
              <div key={t.name} className="card p-5 hover:shadow-md transition-shadow">
                <p className="text-sm text-blue-600 font-medium">{t.category}</p>
                <h3 className="text-lg font-semibold mt-1">{t.name}</h3>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/ar/dashboard/projects" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
              ابدأ مشروعاً <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">جاهز للبدء؟</h2>
          <p className="text-blue-200 mb-8 text-lg">أنشئ حسابك المجاني الآن وابدأ مشروعاً الأول في دقائق</p>
          <Link href="/ar/auth/signup" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            إنشاء حساب مجاني
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="text-xl font-bold">NADOS</span>
              </div>
              <p className="text-gray-400 text-sm">من أرض الحضارة... نصنع مستقبل التكنولوجيا</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الخدمات</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>تطوير المواقع</li>
                <li>الهندسة</li>
                <li>تحليل الأسواق</li>
                <li>التعليم</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الروابط</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>حول</li>
                <li>اتصل بنا</li>
                <li>سياسة الخصوصية</li>
                <li>شروط الاستخدام</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <p className="text-gray-400 text-sm">info@nados.iq</p>
              <p className="text-gray-400 text-sm mt-2">+964 770 123 4567</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}