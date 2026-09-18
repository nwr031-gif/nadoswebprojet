import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const category = searchParams.get('category') || '';

    const all = await db.select().from(projects)
      .where(eq(projects.isPublic, true))
      .orderBy(desc(projects.createdAt))
      .limit(200);

    const filtered = all
      .filter((p) => !p.deletedAt)
      .filter((p) => !search ||
        (p.name || '').toLowerCase().includes(search) ||
        (p.description || '').toLowerCase().includes(search))
      .filter((p) => !category || p.category === category);

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('Showcase GET error:', err);
    return NextResponse.json([]);
  }
}