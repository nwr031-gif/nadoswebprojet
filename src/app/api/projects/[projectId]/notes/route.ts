import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectNotes, projects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function verifyOwnership(projectId: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  return project && (project.userId === userId);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const owned = await verifyOwnership(params.projectId, session.user.id as string);
    if (!owned) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const notes = await db.select().from(projectNotes)
      .where(eq(projectNotes.projectId, params.projectId));
    return NextResponse.json(notes);
  } catch (err) {
    console.error('Notes GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const owned = await verifyOwnership(params.projectId, session.user.id as string);
    if (!owned) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json({ error: 'المحتوى مطلوب' }, { status: 400 });
    }

    const [note] = await db.insert(projectNotes).values({
      projectId: params.projectId,
      userId: session.user.id as string,
      content: body.content,
    }).returning();

    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    console.error('Notes POST error:', err);
    return NextResponse.json({ error: 'تعذّر إضافة الملاحظة' }, { status: 500 });
  }
}