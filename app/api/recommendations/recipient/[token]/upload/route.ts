import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecommendationRequest } from '@/lib/models';
import { getPresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';

/**
 * POST /api/recommendations/recipient/[token]/upload
 * Get S3 presigned URL for file upload
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('Processing upload request for token:', resolvedParams.token);
    
    await connectDB();
    
    // Find request by token
    const recommendationRequest = await RecommendationRequest.findOne({
      secureToken: resolvedParams.token,
      tokenExpiresAt: { $gt: new Date() }
    });

    if (!recommendationRequest) {
      console.error('Invalid or expired token:', resolvedParams.token);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Check if request is still valid
    if (recommendationRequest.status === 'cancelled') {
      console.error('Request cancelled for token:', resolvedParams.token);
      return NextResponse.json({ error: 'Request has been cancelled' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in upload request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Only PDF, DOC, and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('File size exceeds limit:', file.size);
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Debug environment variables
    console.log('S3 Environment variables check:', {
      AWS_REGION: process.env.AWS_REGION ? 'Set' : 'Missing',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET ? 'Set' : 'Missing',
    });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const filename = `${randomUUID()}.${fileExtension}`;
    const s3Key = `recommendations/${recommendationRequest._id}/${filename}`;

    console.log('Generating presigned URL for S3 key:', s3Key);

    // Generate S3 pre-signed URL
    const s3Url = await getPresignedUploadUrl({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      ContentType: file.type,
      expiresIn: 300, // 5 minutes
    });

    // Generate S3 object URL
    const s3ObjectUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    console.log('Upload preparation successful:', {
      filename,
      s3Key,
      fileType: file.type,
      fileSize: file.size
    });

    return NextResponse.json({
      success: true,
      presignedUrl: s3Url,
      fileUrl: s3ObjectUrl,
      fileType: file.type,
      fileSize: file.size,
      filename,
      originalName: file.name,
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 