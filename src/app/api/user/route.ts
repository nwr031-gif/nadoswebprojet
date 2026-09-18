import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id as string),
    });
    const userSessions = await db.select().from(sessions)
      .where(eq(sessions.userId, session.user.id as string));

    return NextResponse.json({
      user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null,
      sessions: userSessions,
    });
  } catch (err) {
    console.error('User GET error:', err);
    return NextResponse.json({ user: null, sessions: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (body.name) {
      await db.update(users)
        .set({ name: body.name, updatedAt: new Date() })
        .where(eq(users.id, session.user.id as string));
    }
    return NextResponse.json({ message: 'تم تحديث الملف الشخصي' });
  } catch (err) {
    console.error('User PATCH error:', err);
    return NextResponse.json({ error: 'تعذّر التحديث' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    } else {
      await db.delete(sessions).where(eq(sessions.userId, session.user.id as string));
    }
    return NextResponse.json({ message: 'تم إنهاء الجلسة' });
  } catch (err) {
    console.error('User DELETE error:', err);
    return NextResponse.json({ error: 'تعذّر تنفيذ العملية' }, { status: 500 });
  }
}