import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate required environment variables
const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required AWS environment variables:', missingVars);
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getPresignedUploadUrl({
  Bucket,
  Key,
  ContentType,
  expiresIn = 300, // 5 minutes
}: {
  Bucket: string;
  Key: string;
  ContentType: string;
  expiresIn?: number;
}) {
  try {
    // Validate inputs
    if (!Bucket || !Key || !ContentType) {
      throw new Error('Missing required parameters: Bucket, Key, and ContentType are required');
    }

    const command = new PutObjectCommand({
      Bucket,
      Key,
      ContentType,
      ACL: 'private',
    });
    
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    throw new Error(`Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getPresignedDownloadUrl({
  Bucket,
  Key,
  expiresIn = 300, // 5 minutes
  forceDownload = true,
}: {
  Bucket: string;
  Key: string;
  expiresIn?: number;
  forceDownload?: boolean;
}) {
  try {
    // Validate inputs
    if (!Bucket || !Key) {
      throw new Error('Missing required parameters: Bucket and Key are required');
    }

    const command = new GetObjectCommand({
      Bucket,
      Key,
      ...(forceDownload && { ResponseContentDisposition: 'attachment' }),
    });
    
    return await getSignedUrl(s3, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getPresignedPreviewUrl({
  Bucket,
  Key,
  expiresIn = 300, // 5 minutes
}: {
  Bucket: string;
  Key: string;
  expiresIn?: number;
}) {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    // No ResponseContentDisposition to allow inline viewing
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export default s3; 