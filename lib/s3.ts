import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
  const command = new PutObjectCommand({
    Bucket,
    Key,
    ContentType,
    ACL: 'private',
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function getPresignedDownloadUrl({
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
    ResponseContentDisposition: 'attachment',
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export default s3; 