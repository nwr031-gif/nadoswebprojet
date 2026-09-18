import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, projects, serviceRequests, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  try {
    const [usersList, projectsList, requestsList] = await Promise.all([
      db.select().from(users).limit(200),
      db.select().from(projects).limit(500),
      db.select().from(serviceRequests).limit(500),
    ]);

    return NextResponse.json({
      users: usersList,
      projects: projectsList,
      requests: requestsList,
    });
  } catch (err) {
    console.error('Admin GET error:', err);
    return NextResponse.json({ users: [], projects: [], requests: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'بيانات مطلوبة' }, { status: 400 });
    }

    if (action === 'ban') {
      if (!reason || reason.length < 10) {
        return NextResponse.json({ error: 'السبب مطلوب (10 أحرف على الأقل)' }, { status: 400 });
      }
      await db.update(users).set({ banned: true, banReason: reason }).where(eq(users.id, userId));
      await db.insert(auditLogs).values({
        actorId: session.user.id as string,
        action: 'ban_user',
        targetType: 'user',
        targetId: userId,
        metadata: { reason },
      }).catch(() => {});
      return NextResponse.json({ message: 'تم حظر المستخدم' });
    }

    if (action === 'unban') {
      await db.update(users).set({ banned: false, banReason: null }).where(eq(users.id, userId));
      await db.insert(auditLogs).values({
        actorId: session.user.id as string,
        action: 'unban_user',
        targetType: 'user',
        targetId: userId,
      }).catch(() => {});
      return NextResponse.json({ message: 'تم إلغاء حظر المستخدم' });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (err) {
    console.error('Admin PATCH error:', err);
    return NextResponse.json({ error: 'تعذّر تنفيذ الإجراء' }, { status: 500 });
  }
}