'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { initializeAnalytics, destroyAnalytics } from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // Generate session ID
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Get user information
        const userId = session?.user?.type === 'admin' ? null : session?.user?.id;
        const adminId = session?.user?.type === 'admin' ? session?.user?.id : null;
        const userType = session?.user?.type || 'anonymous';
        const userRole = session?.user?.role ? String(session.user.role) : undefined;

        // Create session on server
        const response = await fetch('/api/analytics/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            adminId,
            referrer: document.referrer,
            entryPage: window.location.pathname,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }),
        });

        if (response.ok) {
          const { sessionId: serverSessionId } = await response.json();
          
          // Initialize client-side analytics
          initializeAnalytics({
            sessionId: serverSessionId,
            userId: userId || undefined,
            userType: userType as 'anonymous' | 'registered' | 'admin',
            userRole
          });

          // Store session data for persistence
          sessionStorage.setItem('analytics_session', JSON.stringify({
            sessionId: serverSessionId,
            userId,
            adminId,
            userType,
            userRole
          }));

          setIsInitialized(true);
        }
      } catch (error) {
        console.warn('Failed to initialize analytics:', error);
      }
    };

    // Initialize analytics when component mounts
    initializeTracking();

    // Cleanup on unmount
    return () => {
      destroyAnalytics();
    };
  }, [session]);

  // Track page changes
  useEffect(() => {
    const handleRouteChange = () => {
      // Analytics will automatically track page views
      // This is handled by the AnalyticsTracker class
    };

    // Listen for route changes (Next.js)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Track user authentication changes
  useEffect(() => {
    if (session?.user && isInitialized) {
      // Track login event
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionStorage.getItem('analytics_session') ? 
            JSON.parse(sessionStorage.getItem('analytics_session')!).sessionId : null,
          userId: session.user.id,
          eventType: 'login',
          eventCategory: 'authentication',
          eventName: 'user_logged_in',
          eventData: {
            userType: session.user.type,
            userRole: session.user.role ? String(session.user.role) : undefined
          },
          pageUrl: window.location.href,
          pageTitle: document.title,
          userType: session.user.type,
          userRole: session.user.role ? String(session.user.role) : undefined
        }),
      }).catch(error => {
        console.warn('Failed to track login event:', error);
      });
    }
  }, [session, isInitialized]);

  return <>{children}</>;
}

// Hook to track custom events
export function useAnalytics() {
  const trackEvent = (eventData: {
    eventType: string;
    eventCategory: string;
    eventName: string;
    eventData?: any;
  }) => {
    const sessionData = sessionStorage.getItem('analytics_session');
    if (!sessionData) return;

    const { sessionId, userId, userType, userRole } = JSON.parse(sessionData);

    fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        userId,
        eventType: eventData.eventType,
        eventCategory: eventData.eventCategory,
        eventName: eventData.eventName,
        eventData: eventData.eventData,
        pageUrl: window.location.href,
        pageTitle: document.title,
        userType,
        userRole
      }),
    }).catch(error => {
      console.warn('Failed to track event:', error);
    });
  };

  return { trackEvent };
}