import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams.token;
  const error = searchParams.error;

  if (token) {
    const tokenRecord = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });

    if (tokenRecord && new Date(tokenRecord.expires) > new Date()) {
      await db.update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.email, tokenRecord.identifier));

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold">تم تفعيل حسابك بنجاح</h2>
            <p className="mt-2 text-gray-600">يمكنك الآن تسجيل الدخول</p>
            <Link href="/ar/auth/signin" className="btn-primary inline-block mt-6 px-6 py-2.5">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">
          {error ? 'حدث خطأ في التفعيل' : 'رابط التفعيل غير صالح'}
        </h2>
        <p className="mt-2 text-gray-600">
          {error || 'يرجى طلب رابط تفعيل جديد'}
        </p>
        <Link href="/ar/auth/signin" className="btn-primary inline-block mt-6 px-6 py-2.5">
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  );
}