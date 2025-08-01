import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import MediaFile from '@/models/MediaFile';
import { getPresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const filename = `${randomUUID()}.${fileExtension}`;
    const s3Key = `media/${filename}`;
    // Generate S3 pre-signed URL
    const s3Url = await getPresignedUploadUrl({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      ContentType: file.type,
      expiresIn: 300,
    });
    // Save file metadata to database (URL will be S3 object URL)
    const s3ObjectUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    const mediaFile = new MediaFile({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: s3ObjectUrl,
      uploadedBy: session.user.email,
      alt: file.name.split('.')[0],
    });
    await mediaFile.save();
    return NextResponse.json({
      success: true,
      data: {
        id: mediaFile._id,
        filename: mediaFile.filename,
        url: mediaFile.url,
        originalName: mediaFile.originalName,
        size: mediaFile.size,
        mimeType: mediaFile.mimeType,
        presignedUrl: s3Url,
      },
      message: 'S3 upload URL generated. Upload your file directly to S3 using this URL.'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { alt: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (type) {
      query.mimeType = { $regex: type, $options: 'i' };
    }
    
    // Get files with pagination
    const [files, total] = await Promise.all([
      MediaFile.find(query)
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MediaFile.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
} 