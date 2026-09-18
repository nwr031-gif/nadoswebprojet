import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const record = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.tokenHash, token),
    });

    if (!record || record.usedAt || new Date(record.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'الرابط منتهي الصلاحية أو غير صالح' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, record.userId));
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));

    return NextResponse.json({ message: 'تم تحديث كلمة المرور' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'تعذّر التحديث — تأكد من اتصال قاعدة البيانات' }, { status: 500 });
  }
}