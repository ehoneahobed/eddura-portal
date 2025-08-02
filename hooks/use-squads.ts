import useSWR, { mutate } from 'swr';
import { useSession } from 'next-auth/react';

interface Squad {
  _id: string;
  name: string;
  description: string;
  maxMembers: number;
  visibility: 'public' | 'private' | 'invite_only';
  formationType: 'general' | 'academic_level' | 'field_of_study' | 'geographic' | 'activity_based';
  academicLevel?: string[];
  fieldOfStudy?: string[];
  geographicRegion?: string[];
  activityLevel?: 'high' | 'medium' | 'low';
  goals: Array<{
    type: 'applications_started' | 'applications_completed' | 'documents_created' | 'peer_reviews_provided' | 'days_active' | 'streak_days' | 'squad_activity';
    target: number;
    timeframe: 'weekly' | 'monthly' | 'quarterly' | 'ongoing';
    startDate: string;
    endDate: string;
    description?: string;
    individualTarget?: number;
    currentProgress: number;
    progressPercentage: number;
    daysRemaining: number;
    isOnTrack: boolean;
    memberProgress: Array<{
      userId: string;
      progress: number;
      target: number;
      percentage: number;
      lastActivity: string;
      needsHelp: boolean;
      isOnTrack: boolean;
    }>;
  }>;
  squadType: 'primary' | 'secondary';
  creatorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  memberIds: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    platformStats?: {
      documentsCreated: number;
      applicationsStarted: number;
      peerReviewsProvided: number;
      daysActive: number;
      lastActive: string;
    };
  }>;
  totalApplications: number;
  totalDocuments: number;
  totalReviews: number;
  averageActivityScore: number;
  memberCount: number;
  activityLevel: 'high' | 'medium' | 'low';
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateSquadData {
  name: string;
  description: string;
  maxMembers: number;
  visibility?: 'public' | 'private' | 'invite_only';
  formationType?: 'general' | 'academic_level' | 'field_of_study' | 'geographic' | 'activity_based';
  academicLevel?: string[];
  fieldOfStudy?: string[];
  geographicRegion?: string[];
  activityLevel?: 'high' | 'medium' | 'low';
  squadType?: 'primary' | 'secondary';
  goals?: Array<{
    type: 'applications_started' | 'applications_completed' | 'documents_created' | 'peer_reviews_provided' | 'days_active' | 'streak_days' | 'squad_activity';
    target: number;
    timeframe: 'weekly' | 'monthly' | 'quarterly' | 'ongoing';
    startDate: string;
    endDate: string;
    description?: string;
    individualTarget?: number;
  }>;
}

interface UpdateSquadData extends Partial<CreateSquadData> {
  goals?: Array<{
    type: 'applications_started' | 'applications_completed' | 'documents_created' | 'peer_reviews_provided' | 'days_active' | 'streak_days' | 'squad_activity';
    target: number;
    timeframe: 'weekly' | 'monthly' | 'quarterly' | 'ongoing';
    startDate: string;
    endDate: string;
    description?: string;
    individualTarget?: number;
    currentProgress?: number;
    progressPercentage?: number;
    daysRemaining?: number;
    isOnTrack?: boolean;
    memberProgress?: Array<{
      userId: string;
      progress: number;
      target: number;
      percentage: number;
      lastActivity: string;
      needsHelp: boolean;
      isOnTrack: boolean;
    }>;
  }>;
}

interface ProgressData {
  goalType: 'applications_started' | 'applications_completed' | 'documents_created' | 'peer_reviews_provided' | 'days_active' | 'streak_days' | 'squad_activity';
  progress: number;
  userId?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSquads(type?: 'primary' | 'secondary' | 'all', visibility?: string) {
  const { data: session } = useSession();
  
  const params = new URLSearchParams();
  if (session?.user?.email) {
    params.append('userId', session.user.email);
  }
  if (type) {
    params.append('type', type);
  }
  if (visibility) {
    params.append('visibility', visibility);
  }

  const { data, error, isLoading, mutate: refetch } = useSWR(
    session ? `/api/squads?${params.toString()}` : null,
    fetcher
  );

  return {
    squads: data?.squads || [],
    error,
    isLoading,
    refetch
  };
}

export function useSquad(id: string) {
  const { data: session } = useSession();
  
  const { data, error, isLoading, mutate: refetch } = useSWR(
    session && id ? `/api/squads/${id}` : null,
    fetcher
  );

  return {
    squad: data?.squad,
    error,
    isLoading,
    refetch
  };
}

export function useSquadProgress(id: string) {
  const { data: session } = useSession();
  
  const { data, error, isLoading, mutate: refetch } = useSWR(
    session && id ? `/api/squads/${id}/progress` : null,
    fetcher
  );

  return {
    squad: data?.squad,
    progressSummary: data?.progressSummary,
    error,
    isLoading,
    refetch
  };
}

export async function createSquad(squadData: CreateSquadData): Promise<Squad> {
  const response = await fetch('/api/squads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(squadData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create squad');
  }

  const data = await response.json();
  await mutate('/api/squads');
  return data.squad;
}

export async function updateSquad(id: string, squadData: UpdateSquadData): Promise<Squad> {
  const response = await fetch(`/api/squads/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(squadData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update squad');
  }

  const data = await response.json();
  await mutate(`/api/squads/${id}`);
  await mutate('/api/squads');
  return data.squad;
}

export async function deleteSquad(id: string): Promise<void> {
  const response = await fetch(`/api/squads/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete squad');
  }

  await mutate('/api/squads');
}

export async function joinSquad(id: string): Promise<void> {
  const response = await fetch(`/api/squads/${id}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'join' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join squad');
  }

  await mutate(`/api/squads/${id}`);
  await mutate('/api/squads');
}

export async function leaveSquad(id: string): Promise<void> {
  const response = await fetch(`/api/squads/${id}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'leave' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to leave squad');
  }

  await mutate(`/api/squads/${id}`);
  await mutate('/api/squads');
}

export async function updateSquadProgress(id: string, progressData: ProgressData): Promise<void> {
  const response = await fetch(`/api/squads/${id}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(progressData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update squad progress');
  }

  await mutate(`/api/squads/${id}/progress`);
  await mutate(`/api/squads/${id}`);
  await mutate('/api/squads');
}