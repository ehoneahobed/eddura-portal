import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecommendationRequest } from '@/lib/models';
import s3 from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

/**
 * POST /api/recommendations/recipient/[token]/upload-fallback
 * Fallback server-side upload when direct S3 upload fails
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('Processing fallback upload for token:', resolvedParams.token);
    
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
      console.error('No file provided in fallback upload request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Fallback upload file received:', {
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

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const filename = `${randomUUID()}.${fileExtension}`;
    const s3Key = `recommendations/${recommendationRequest._id}/${filename}`;

    console.log('Performing server-side upload for S3 key:', s3Key);

    // Convert file to buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to S3 using server-side SDK
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'private',
    });

    await s3.send(uploadCommand);

    // Generate S3 object URL
    const s3ObjectUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    console.log('Fallback upload successful:', {
      filename,
      s3Key,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: s3ObjectUrl
    });

    return NextResponse.json({
      success: true,
      fileUrl: s3ObjectUrl,
      fileType: file.type,
      fileSize: file.size,
      filename,
      originalName: file.name,
    }, { status: 201 });

  } catch (error) {
    console.error('Fallback upload error:', error);
    return NextResponse.json(
      { error: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 