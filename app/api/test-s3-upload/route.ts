import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';

/**
 * POST /api/test-s3-upload
 * Test endpoint for S3 upload debugging
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Test S3 upload endpoint called');
    
    // Validate environment variables
    const requiredEnvVars = {
      AWS_REGION: process.env.AWS_REGION,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('Missing required AWS environment variables:', missingVars);
      return NextResponse.json(
        { error: `Missing environment variables: ${missingVars.join(', ')}` },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Test file received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'txt';
    const filename = `${randomUUID()}.${fileExtension}`;
    const s3Key = `test-uploads/${filename}`;

    console.log('Generating test presigned URL for S3 key:', s3Key);

    // Generate S3 pre-signed URL
    const s3Url = await getPresignedUploadUrl({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      ContentType: file.type,
      expiresIn: 300, // 5 minutes
    });

    // Generate S3 object URL
    const s3ObjectUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    console.log('Test upload preparation successful:', {
      filename,
      s3Key,
      fileType: file.type,
      fileSize: file.size,
      presignedUrl: s3Url
    });

    return NextResponse.json({
      success: true,
      presignedUrl: s3Url,
      fileUrl: s3ObjectUrl,
      fileType: file.type,
      fileSize: file.size,
      filename,
      originalName: file.name,
      s3Key,
    }, { status: 201 });

  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json(
      { error: `Failed to generate test upload URL: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 