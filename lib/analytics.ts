/**
 * Client-side analytics tracking utilities
 * Handles user session tracking, page views, and user events
 */

export interface AnalyticsConfig {
  sessionId: string;
  userId?: string;
  userType?: 'anonymous' | 'registered' | 'admin';
  userRole?: string;
}

export interface PageViewData {
  pageUrl: string;
  pageTitle: string;
  pageType: string;
  timeOnPage?: number;
  scrollDepth?: number;
  isBounce?: boolean;
  pageLoadTime?: number;
  domContentLoaded?: number;
}

export interface UserEventData {
  eventType: string;
  eventCategory: string;
  eventName: string;
  eventData?: any;
  pageUrl?: string;
  pageTitle?: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private userId?: string;
  private userType: 'anonymous' | 'registered' | 'admin';
  private userRole?: string;
  private currentPageStartTime: number;
  private currentPageUrl: string;
  private scrollDepth: number = 0;
  private isPageActive: boolean = true;
  private heartbeatInterval?: NodeJS.Timeout;
  private pageLoadStartTime: number;

  constructor(config: AnalyticsConfig) {
    this.sessionId = config.sessionId;
    this.userId = config.userId;
    this.userType = config.userType || 'anonymous';
    this.userRole = config.userRole;
    this.currentPageStartTime = Date.now();
    this.currentPageUrl = window.location.href;
    this.pageLoadStartTime = performance.now();

    this.initializeTracking();
  }

  private initializeTracking() {
    // Track page load performance
    this.trackPageLoadPerformance();

    // Track scroll depth
    this.trackScrollDepth();

    // Track page visibility changes
    this.trackPageVisibility();

    // Start heartbeat for active session tracking
    this.startHeartbeat();

    // Track beforeunload to capture exit data
    this.trackPageExit();

    // Track user interactions
    this.trackUserInteractions();
  }

  private trackPageLoadPerformance() {
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.pageLoadStartTime;
      const domContentLoaded = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.updatePageView({
        pageLoadTime: Math.round(loadTime),
        domContentLoaded: Math.round(domContentLoaded?.domContentLoadedEventEnd || 0)
      });
    });
  }

  private trackScrollDepth() {
    let maxScrollDepth = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScrollDepth = Math.round((scrollTop / scrollHeight) * 100);
      
      if (currentScrollDepth > maxScrollDepth) {
        maxScrollDepth = currentScrollDepth;
        this.scrollDepth = maxScrollDepth;
        this.updatePageView({ scrollDepth: maxScrollDepth });
      }
    });
  }

  private trackPageVisibility() {
    document.addEventListener('visibilitychange', () => {
      this.isPageActive = !document.hidden;
      
      if (document.hidden) {
        // Page became hidden, update time on page
        const timeOnPage = Math.round((Date.now() - this.currentPageStartTime) / 1000);
        this.updatePageView({ timeOnPage });
      } else {
        // Page became visible, reset start time
        this.currentPageStartTime = Date.now();
      }
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isPageActive) {
        this.sendHeartbeat();
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private trackPageExit() {
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - this.currentPageStartTime) / 1000);
      this.updatePageView({ 
        timeOnPage,
        isBounce: true 
      });
      
      // Send final page view data
      this.sendPageView();
    });
  }

  private trackUserInteractions() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const element = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;
      
      this.trackEvent({
        eventType: 'click',
        eventCategory: 'interaction',
        eventName: 'page_click',
        eventData: {
          element,
          className,
          id,
          text: target.textContent?.slice(0, 100)
        }
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent({
        eventType: 'form_submit',
        eventCategory: 'engagement',
        eventName: 'form_submitted',
        eventData: {
          formId: form.id,
          formAction: form.action,
          formMethod: form.method
        }
      });
    });

    // Track downloads
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && (link.download || link.href.includes('.pdf') || link.href.includes('.doc'))) {
        this.trackEvent({
          eventType: 'download',
          eventCategory: 'engagement',
          eventName: 'file_downloaded',
          eventData: {
            fileName: link.download || link.href.split('/').pop(),
            fileUrl: link.href
          }
        });
      }
    });
  }

  public trackPageView(data: PageViewData) {
    const pageViewData = {
      sessionId: this.sessionId,
      userId: this.userId,
      pageUrl: data.pageUrl,
      pageTitle: data.pageTitle,
      pageType: data.pageType,
      timeOnPage: data.timeOnPage || 0,
      scrollDepth: data.scrollDepth || 0,
      isBounce: data.isBounce || false,
      pageLoadTime: data.pageLoadTime,
      domContentLoaded: data.domContentLoaded,
      userAgent: navigator.userAgent,
      browser: this.getBrowserInfo(),
      os: this.getOSInfo(),
      device: this.getDeviceInfo(),
      screenResolution: `${screen.width}x${screen.height}`,
      referrer: document.referrer,
      referrerDomain: document.referrer ? new URL(document.referrer).hostname : null
    };

    this.sendToServer('/api/analytics/pageview', pageViewData);
  }

  public trackEvent(data: UserEventData) {
    const eventData = {
      sessionId: this.sessionId,
      userId: this.userId,
      eventType: data.eventType,
      eventCategory: data.eventCategory,
      eventName: data.eventName,
      eventData: data.eventData,
      pageUrl: data.pageUrl || window.location.href,
      pageTitle: data.pageTitle || document.title,
      userType: this.userType,
      userRole: this.userRole,
      userAgent: navigator.userAgent,
      browser: this.getBrowserInfo(),
      os: this.getOSInfo(),
      device: this.getDeviceInfo()
    };

    this.sendToServer('/api/analytics/event', eventData);
  }

  private updatePageView(data: Partial<PageViewData>) {
    // Update current page view data
    Object.assign(this, data);
  }

  private sendPageView() {
    const timeOnPage = Math.round((Date.now() - this.currentPageStartTime) / 1000);
    
    this.trackPageView({
      pageUrl: this.currentPageUrl,
      pageTitle: document.title,
      pageType: this.getPageType(),
      timeOnPage,
      scrollDepth: this.scrollDepth,
      isBounce: false
    });
  }

  private sendHeartbeat() {
    this.sendToServer('/api/analytics/heartbeat', {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  private async sendToServer(endpoint: string, data: any) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  public getPageType(): string {
    const path = window.location.pathname;
    
    if (path === '/') return 'home';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/auth')) return 'authentication';
    if (path.startsWith('/schools')) return 'schools';
    if (path.startsWith('/programs')) return 'programs';
    if (path.startsWith('/scholarships')) return 'scholarships';
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/profile')) return 'profile';
    
    return 'other';
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  private getOSInfo(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'Unknown';
  }

  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Send final page view
    this.sendPageView();
  }
}

// Global analytics instance
let analyticsInstance: AnalyticsTracker | null = null;

export const initializeAnalytics = (config: AnalyticsConfig) => {
  if (typeof window === 'undefined') return;
  
  analyticsInstance = new AnalyticsTracker(config);
  
  // Track initial page view
  analyticsInstance.trackPageView({
    pageUrl: window.location.href,
    pageTitle: document.title,
    pageType: analyticsInstance.getPageType()
  });
};

export const trackEvent = (data: UserEventData) => {
  if (analyticsInstance) {
    analyticsInstance.trackEvent(data);
  }
};

export const destroyAnalytics = () => {
  if (analyticsInstance) {
    analyticsInstance.destroy();
    analyticsInstance = null;
  }
};

// Auto-initialize analytics if session data is available
if (typeof window !== 'undefined') {
  // Check for session data in localStorage or sessionStorage
  const sessionData = sessionStorage.getItem('analytics_session');
  
  if (sessionData) {
    try {
      const config = JSON.parse(sessionData);
      initializeAnalytics(config);
    } catch (error) {
      console.warn('Failed to initialize analytics:', error);
    }
  }
}