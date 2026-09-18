import { CredentialsForm } from '@/components/auth/CredentialsForm';
import { GoogleButton } from '@/components/auth/GoogleButton';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">N</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">إنشاء حساب جديد</h2>
          <p className="mt-2 text-sm text-gray-600">ابدأ باستخدام نادوس مجاناً</p>
        </div>
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <CredentialsForm />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">أو</span>
            </div>
          </div>
          <GoogleButton callbackUrl="/ar/dashboard" />
          <p className="text-center text-sm text-gray-600">
            لديك حساب؟{' '}
            <Link href="/ar/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              سجّل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}