import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, projectActivity } from '@/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { slugify } from '@/lib/utils';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const all = await db.select().from(projects)
      .where(and(eq(projects.userId, session.user.id as string), isNull(projects.deletedAt)))
      .orderBy(desc(projects.createdAt));
    return NextResponse.json(all);
  } catch (err) {
    console.error('Projects GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, category, templateId, description } = body;

    if (!name || name.length < 3) {
      return NextResponse.json({ error: 'اسم المشروع مطلوب (3 أحرف على الأقل)' }, { status: 400 });
    }

    const slug = `${slugify(name)}-${nanoid(6)}`;

    const [newProject] = await db.insert(projects).values({
      name,
      slug,
      description: description || null,
      category: category || 'custom',
      templateId: templateId || null,
      userId: session.user.id as string,
      status: 'draft',
      progress: 0,
    }).returning();

    await db.insert(projectActivity).values({
      projectId: newProject.id,
      userId: session.user.id as string,
      action: 'project_created',
    }).catch(() => {});

    return NextResponse.json(newProject, { status: 201 });
  } catch (err) {
    console.error('Projects POST error:', err);
    return NextResponse.json({ error: 'تعذّر إنشاء المشروع — تأكد من اتصال قاعدة البيانات' }, { status: 500 });
  }
}