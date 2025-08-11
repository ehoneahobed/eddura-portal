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

  const analyticsEnabled = typeof window !== 'undefined' &&
    (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true');
  const sampleRate = Number(process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE || '0.25');

  useEffect(() => {
    if (!analyticsEnabled) return; // Hard gate
    if (navigator.doNotTrack === '1') return; // Respect DNT
    if (Math.random() > sampleRate) return; // Traffic sampling

    const initializeTracking = async () => {
      try {
        // Check if we already have a valid session
        const existingSessionData = sessionStorage.getItem('analytics_session');
        let sessionId: string;
        let serverSessionId: string;

        if (existingSessionData) {
          try {
            const parsed = JSON.parse(existingSessionData);
            const sessionAge = Date.now() - (parsed.timestamp || 0);
            const maxSessionAge = 30 * 60 * 1000; // 30 minutes
            if (sessionAge < maxSessionAge && parsed.sessionId) {
              sessionId = parsed.sessionId;
              serverSessionId = parsed.sessionId;
              initializeAnalytics({
                sessionId: serverSessionId,
                userId: parsed.userId || undefined,
                userType: parsed.userType as 'anonymous' | 'registered' | 'admin',
                userRole: parsed.userRole
              });
              setIsInitialized(true);
              return;
            }
          } catch (error) {
            console.warn('Failed to parse existing session data:', error);
          }
        }

        // Create new session if no valid existing session
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const userId = session?.user?.type === 'admin' ? null : session?.user?.id;
        const adminId = session?.user?.type === 'admin' ? session?.user?.id : null;
        const userType = session?.user?.type || 'anonymous';
        const userRole = session?.user?.role ? String(session.user.role) : undefined;

        // Create session on server (send client sessionId for precise reuse)
        const response = await fetch('/api/analytics/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userId,
            adminId,
            referrer: document.referrer,
            entryPage: window.location.pathname,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }),
        });

        if (response.ok) {
          const { sessionId: newServerSessionId } = await response.json();
          serverSessionId = newServerSessionId;
          initializeAnalytics({
            sessionId: serverSessionId,
            userId: userId || undefined,
            userType: userType as 'anonymous' | 'registered' | 'admin',
            userRole
          });
          sessionStorage.setItem('analytics_session', JSON.stringify({
            sessionId: serverSessionId,
            userId,
            adminId,
            userType,
            userRole,
            timestamp: Date.now()
          }));
          setIsInitialized(true);
        }
      } catch (error) {
        console.warn('Failed to initialize analytics:', error);
      }
    };

    initializeTracking();

    return () => {
      destroyAnalytics();
    };
  }, [session, analyticsEnabled, sampleRate]);

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