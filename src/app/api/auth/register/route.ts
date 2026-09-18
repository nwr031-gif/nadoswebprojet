import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const lowerEmail = email.toLowerCase();

    const existing = await db.query.users.findFirst({
      where: eq(users.email, lowerEmail),
    });
    if (existing) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const token = crypto.randomUUID();

    await db.insert(users).values({ name, email: lowerEmail, passwordHash });
    await db.insert(verificationTokens).values({
      identifier: lowerEmail,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({
      message: 'تم إنشاء الحساب. تحقق من بريدك الإلكتروني.',
    }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'تعذّر إنشاء الحساب — تأكد من اتصال قاعدة البيانات' }, { status: 500 });
  }
}