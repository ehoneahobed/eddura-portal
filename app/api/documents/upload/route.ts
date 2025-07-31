import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// POST /api/documents/upload - Get S3 presigned URL for file upload (for upload-based document types)
export async function POST(request: NextRequest) {
  console.log('📁 Document upload endpoint called');
  try {
    const session = await auth();
    console.log('🔐 Session check:', !!session?.user?.id);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log('📄 File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'No file');
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Accept only PDF, DOC, DOCX, TXT, etc.
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
    
    // 10MB limit
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }
    
    const fileExtension = file.name.split('.').pop();
    const filename = `${randomUUID()}.${fileExtension}`;
    const s3Key = `documents/${session.user.id}/${filename}`;
    
    console.log('🔧 S3 config check:', {
      bucket: !!process.env.AWS_S3_BUCKET,
      region: !!process.env.AWS_REGION,
      accessKey: !!process.env.AWS_ACCESS_KEY_ID,
      secretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
    
    // Upload file directly to S3 on the server side
    const s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      ACL: 'private',
    });
    
    await s3.send(uploadCommand);
    
    const s3ObjectUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    
    console.log('✅ File uploaded to S3 successfully');
    return NextResponse.json({
      fileUrl: s3ObjectUrl,
      fileType: file.type,
      fileSize: file.size,
      filename,
    }, { status: 201 });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
} 