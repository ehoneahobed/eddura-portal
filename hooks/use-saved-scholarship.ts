import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useSavedScholarship(scholarshipId: string) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scholarshipId && session?.user?.id) {
      checkIfSaved();
    }
  }, [scholarshipId, session?.user?.id]);

  const checkIfSaved = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/saved-scholarships?scholarshipId=${scholarshipId}`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.savedScholarships.length > 0);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveScholarship = async (notes?: string, status: string = 'saved') => {
    try {
      const response = await fetch('/api/user/saved-scholarships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scholarshipId,
          notes,
          status
        })
      });

      if (response.ok) {
        setIsSaved(true);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to save scholarship' };
      }
    } catch (error) {
      console.error('Error saving scholarship:', error);
      return { success: false, error: 'Failed to save scholarship' };
    }
  };

  const unsaveScholarship = async () => {
    try {
      const response = await fetch(`/api/user/saved-scholarships/${scholarshipId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setIsSaved(false);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to remove scholarship' };
      }
    } catch (error) {
      console.error('Error unsaving scholarship:', error);
      return { success: false, error: 'Failed to remove scholarship' };
    }
  };

  return {
    isSaved,
    isLoading,
    saveScholarship,
    unsaveScholarship,
    refetch: checkIfSaved
  };
}