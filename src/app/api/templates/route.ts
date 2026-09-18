import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { templates } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const all = await db.select().from(templates)
      .where(eq(templates.isActive, true))
      .orderBy(templates.displayOrder);
    return NextResponse.json(all);
  } catch (err) {
    console.error('Templates GET error:', err);
    return NextResponse.json([]);
  }
}