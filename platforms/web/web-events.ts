/**
 * Web Events Implementation
 * Browser-optimized event handling with Norwegian compliance
 */

import { getEventBus } from '../../src/event-core';

export class WebEventBus {
  private baseEventBus: any;
  private analyticsEnabled: boolean;

  constructor(config?: { analytics?: boolean; municipality?: string }) {
    this.baseEventBus = getEventBus();
    this.analyticsEnabled = config?.analytics !== false;
  }

  /**
   * Publish event with web analytics tracking
   */
  async publish(eventType: string, data: any, options?: any) {
    const webMetadata = {
      ...data,
      platform: 'web',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      sessionId:
        typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem('foundation-session-id')
          : null,
    };

    // Track analytics if enabled
    if (this.analyticsEnabled && typeof window !== 'undefined') {
      this.trackWebAnalytics(eventType, webMetadata);
    }

    return this.baseEventBus.publish(eventType, webMetadata, options);
  }

  /**
   * Subscribe to events with web-specific processing
   */
  subscribe(eventPattern: string, handler: (event: any) => void) {
    const webHandler = (event: any) => {
      // Add web-specific context
      const webEvent = {
        ...event,
        platform: 'web',
        processingTime: new Date().toISOString(),
      };

      handler(webEvent);
    };

    return this.baseEventBus.subscribe(eventPattern, webHandler);
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(eventPattern: string, handler?: (event: any) => void) {
    return this.baseEventBus.unsubscribe(eventPattern, handler);
  }

  private trackWebAnalytics(eventType: string, data: any) {
    if (typeof window !== 'undefined') {
      // Store analytics event in browser
      const analyticsData = {
        eventType,
        timestamp: new Date().toISOString(),
        data: {
          userAgent: data.userAgent,
          url: data.url,
          sessionId: data.sessionId,
        },
      };

      // Send to analytics service or store locally
      if (typeof localStorage !== 'undefined') {
        const existingAnalytics = localStorage.getItem('foundation-analytics') || '[]';
        const analytics = JSON.parse(existingAnalytics);
        analytics.push(analyticsData);

        // Keep only last 100 events
        if (analytics.length > 100) {
          analytics.splice(0, analytics.length - 100);
        }

        localStorage.setItem('foundation-analytics', JSON.stringify(analytics));
      }
    }
  }
}

/**
 * Create web-optimized event bus
 */
export function createWebEventBus(config?: { analytics?: boolean; municipality?: string }) {
  return new WebEventBus(config);
}
