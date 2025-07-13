import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import { Document } from '@/models/Document';
import DocumentLibrary from '@/components/documents/DocumentLibrary';

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string; category?: string; status?: string; search?: string };
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  await connectDB();

  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {
    userId: session.user.id,
    isLatestVersion: true // Only get latest versions
  };

  if (searchParams.type) query.type = searchParams.type;
  if (searchParams.category) query.category = searchParams.category;
  if (searchParams.status) query.status = searchParams.status;
  if (searchParams.search) {
    query.$or = [
      { title: { $regex: searchParams.search, $options: 'i' } },
      { description: { $regex: searchParams.search, $options: 'i' } },
      { tags: { $in: [new RegExp(searchParams.search, 'i')] } }
    ];
  }

  // Get documents with pagination
  const documents = await Document.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Get total count for pagination
  const total = await Document.countDocuments(query);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentLibrary documents={documents} pagination={pagination} />
    </div>
  );
}