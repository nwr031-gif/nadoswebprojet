import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, projectFiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { generatePresignedUploadUrl, validateFile } from '@/lib/r2';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, fileName, contentType, fileSize } = body;

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const validation = validateFile(fileName, fileSize, contentType);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { uploadUrl, key, uploadId } = await generatePresignedUploadUrl(
      session.user.id as string,
      projectId,
      fileName,
      contentType
    );

    return NextResponse.json({ uploadUrl, key, uploadId });
  } catch (err) {
    console.error('Upload init error:', err);
    return NextResponse.json(
      { error: 'تعذّر بدء الرفع — تأكد من إعداد Cloudflare R2' },
      { status: 500 }
    );
  }
}