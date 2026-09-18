import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { serviceRequests, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const requestSchema = z.object({
  serviceType: z.enum(['web_dev', 'mobile_dev', 'engineering', 'market_analysis', 'education', 'business_solutions', 'custom']),
  title: z.string().min(5).max(150),
  description: z.string().min(50).max(2000),
  budget: z.number().min(0).optional(),
  deadline: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const all = await db.select().from(serviceRequests)
      .where(eq(serviceRequests.userId, session.user.id as string));
    return NextResponse.json(all);
  } catch (err) {
    console.error('Requests GET error:', err);
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
    const idempotencyKey = body.idempotencyKey || nanoid(32);

    const existing = await db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.idempotencyKey, idempotencyKey),
    });
    if (existing) {
      return NextResponse.json(existing);
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة — العنوان (5-150) والوصف (50-2000)' }, { status: 400 });
    }

    const [request] = await db.insert(serviceRequests).values({
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      userId: session.user.id as string,
      idempotencyKey,
    }).returning();

    return NextResponse.json(request, { status: 201 });
  } catch (err) {
    console.error('Requests POST error:', err);
    return NextResponse.json({ error: 'تعذّر إرسال الطلب — تأكد من اتصال قاعدة البيانات' }, { status: 500 });
  }
}