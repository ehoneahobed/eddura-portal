'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/library/documents');
      const data = await response.json();
      setApiResponse({ status: response.status, data });
      setApiError(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unknown error');
      setApiResponse(null);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Session Debug</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session:</strong> {session ? 'Present' : 'Not present'}</p>
            {session && (
              <div className="space-y-2">
                <p><strong>User ID:</strong> {session.user?.id}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Type:</strong> {session.user?.type}</p>
                <p><strong>Name:</strong> {session.user?.name}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">API Test</h2>
          <button 
            onClick={testApiCall}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Library API
          </button>
          
          {apiResponse && (
            <div className="space-y-2">
              <p><strong>Response Status:</strong> {apiResponse.status}</p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(apiResponse.data, null, 2)}
              </pre>
            </div>
          )}
          
          {apiError && (
            <div className="space-y-2">
              <p className="text-red-600"><strong>Error:</strong> {apiError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Raw Session Data</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
} 