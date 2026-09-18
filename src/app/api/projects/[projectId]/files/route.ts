import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectFiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const files = await db.select().from(projectFiles)
      .where(eq(projectFiles.projectId, params.projectId));
    return NextResponse.json(files);
  } catch (err) {
    console.error('Files GET error:', err);
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
    const body = await req.json();
    const { name, originalName, mimeType, size, key } = body;

    const [file] = await db.insert(projectFiles).values({
      projectId: params.projectId,
      userId: session.user.id as string,
      name,
      originalName: originalName || name,
      mimeType,
      size,
      key,
      scanStatus: 'pending',
    }).returning();

    return NextResponse.json(file, { status: 201 });
  } catch (err) {
    console.error('Files POST error:', err);
    return NextResponse.json({ error: 'تعذّر تسجيل الملف' }, { status: 500 });
  }
}