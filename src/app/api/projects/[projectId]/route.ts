import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, projectActivity } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const validTransitions: Record<string, string[]> = {
  draft: ['active'],
  active: ['review', 'archived'],
  review: ['delivered', 'active'],
  delivered: ['archived'],
  archived: [],
};

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, params.projectId),
    });

    if (!project) {
      return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 });
    }

    if (project.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (err) {
    console.error('Project GET error:', err);
    return NextResponse.json({ error: 'تعذّر تحميل المشروع' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, params.projectId),
    });

    if (!project) {
      return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 });
    }

    if (project.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    if (body.status && body.status !== project.status) {
      const allowed = validTransitions[project.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `الانتقال من ${project.status} إلى ${body.status} غير مسموح` },
          { status: 400 }
        );
      }
      await db.insert(projectActivity).values({
        projectId: project.id,
        userId: session.user.id as string,
        action: `status_changed: ${project.status} → ${body.status}`,
      }).catch(() => {});
    }

    const allowedFields = ['name', 'description', 'category', 'status', 'progress', 'isPublic'];
    const updateData: Record<string, any> = { updatedAt: new Date() };
    for (const key of allowedFields) {
      if (key in body) updateData[key] = body[key];
    }

    const [updated] = await db.update(projects)
      .set(updateData)
      .where(eq(projects.id, params.projectId))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Project PATCH error:', err);
    return NextResponse.json({ error: 'تعذّر تحديث المشروع' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, params.projectId),
    });

    if (!project) {
      return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    await db.update(projects)
      .set({ deletedAt: new Date(), status: 'archived' })
      .where(eq(projects.id, params.projectId));

    return NextResponse.json({ message: 'تم حذف المشروع (يمكن استعادته خلال 30 يوماً)' });
  } catch (err) {
    console.error('Project DELETE error:', err);
    return NextResponse.json({ error: 'تعذّر حذف المشروع' }, { status: 500 });
  }
}