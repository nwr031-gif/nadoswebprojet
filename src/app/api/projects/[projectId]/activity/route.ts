import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectActivity } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
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
    const activities = await db.select().from(projectActivity)
      .where(eq(projectActivity.projectId, params.projectId))
      .orderBy(desc(projectActivity.createdAt))
      .limit(100);
    return NextResponse.json(activities);
  } catch (err) {
    console.error('Activity GET error:', err);
    return NextResponse.json([]);
  }
}