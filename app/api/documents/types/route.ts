import { NextResponse } from 'next/server';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/models/Document';

// GET /api/documents/types - Get all document types and their configurations
export async function GET() {
  try {
    // Group document types by category
    const typesByCategory = Object.entries(DOCUMENT_TYPE_CONFIG).reduce((acc, [type, config]) => {
      const category = config.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        type,
        ...config
      });
      return acc;
    }, {} as Record<string, Array<{ type: string } & typeof DOCUMENT_TYPE_CONFIG[DocumentType]>>);

    return NextResponse.json({
      types: DOCUMENT_TYPE_CONFIG,
      typesByCategory,
      categories: Object.keys(typesByCategory)
    });
  } catch (error) {
    console.error('Error fetching document types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}