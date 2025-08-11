import useSWR from 'swr';

export interface TemplateDocument {
  _id: string;
  title: string;
  type: string;
  description: string;
  category: string;
  subcategory?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  isTemplate: boolean;
  allowCloning: boolean;
  viewCount: number;
  cloneCount: number;
  averageRating: number;
  ratingCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TemplatesResponse {
  documents: TemplateDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminTemplatesParams {
  page: number;
  limit: number;
  search?: string;
  templateFilter?: 'all' | 'templates' | 'non-templates';
  statusFilter?: string;
  categoryFilter?: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error: any = new Error('Failed to fetch admin templates');
    try {
      error.info = await response.json();
    } catch {
      // ignore
    }
    error.status = response.status;
    throw error;
  }
  return response.json();
};

function buildUrl(params: AdminTemplatesParams): string {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('limit', String(params.limit));

  if (params.search) {
    query.set('search', params.search);
  }
  if (params.templateFilter && params.templateFilter !== 'all') {
    query.set('isTemplate', params.templateFilter === 'templates' ? 'true' : 'false');
  }
  if (params.statusFilter && params.statusFilter !== 'all') {
    query.set('status', params.statusFilter);
  }
  if (params.categoryFilter && params.categoryFilter !== 'all') {
    query.set('category', params.categoryFilter);
  }

  return `/api/admin/library/templates?${query.toString()}`;
}

export function useAdminTemplates(params: AdminTemplatesParams) {
  const key = buildUrl(params);

  const { data, error, isLoading, isValidating, mutate } = useSWR<TemplatesResponse>(
    key,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 3000,
    }
  );

  return {
    documents: data?.documents ?? [],
    pagination: data?.pagination,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}