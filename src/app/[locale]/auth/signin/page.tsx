import Link from 'next/link';

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams.callbackUrl || '/ar/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">N</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">مرحباً بك في نادوس</h2>
          <p className="mt-2 text-sm text-gray-600">سجّل الدخول للاستمرار</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-sm text-gray-600 text-center mb-4">
            تسجيل الدخول يتطلب اتصالاً بقاعدة البيانات (قيد الإعداد).
          </p>
          <Link href="/ar" className="btn-primary w-full py-2.5 block text-center">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}