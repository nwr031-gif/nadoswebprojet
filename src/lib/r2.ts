import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/utils';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function generatePresignedUploadUrl(
  userId: string,
  projectId: string,
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string; uploadId: string }> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const key = `${userId}/${projectId}/${nanoid()}.${ext}`;
  const uploadId = nanoid();

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      uploadId,
      originalName: filename,
    },
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

  return { uploadUrl, key, uploadId };
}

export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  await r2Client.send(command);
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export function validateFile(filename: string, size: number, mimeType: string): { valid: boolean; error?: string } {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (!ALLOWED_FILE_TYPES.includes(ext as any)) {
    return { valid: false, error: `نوع الملف غير مسموح. الأنواع المسموحة: ${ALLOWED_FILE_TYPES.join(', ')}` };
  }

  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `حجم الملف يتجاوز الحد المسموح (25 ميجابايت)` };
  }

  const allowedMimeTypes: Record<string, string[]> = {
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
    webp: ['image/webp'],
    pdf: ['application/pdf'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    zip: ['application/zip', 'application/x-zip-compressed'],
  };

  const allowed = allowedMimeTypes[ext];
  if (allowed && !allowed.includes(mimeType)) {
    return { valid: false, error: 'نوع الملف غير متطابق مع الامتداد' };
  }

  return { valid: true };
}

export async function scanFileWithClamAV(key: string): Promise<{ clean: boolean; result?: string }> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await r2Client.send(command);
    
    if (!response.Body) {
      return { clean: false, result: 'File not found' };
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const clamavHost = process.env.CLAMAV_HOST || 'localhost';
    const clamavPort = parseInt(process.env.CLAMAV_PORT || '3310');
    
    const net = await import('net');
    return new Promise((resolve) => {
      const socket = net.createConnection(clamavPort, clamavHost, () => {
        socket.write('SCAN\n');
        socket.write(buffer);
        socket.end();
      });

      let responseData = '';
      socket.on('data', (data) => {
        responseData += data.toString();
      });

      socket.on('end', () => {
        const clean = responseData.includes('OK') || responseData.includes('clean');
        resolve({ clean, result: responseData.trim() });
      });

      socket.on('error', (err) => {
        resolve({ clean: false, result: err.message });
      });

      socket.setTimeout(30000, () => {
        socket.destroy();
        resolve({ clean: false, result: 'Scan timeout' });
      });
    });
  } catch (error) {
    return { clean: false, result: error instanceof Error ? error.message : 'Unknown error' };
  }
}