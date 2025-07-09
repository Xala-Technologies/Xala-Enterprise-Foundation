/**
 * Web Metrics Collector
 * Browser-optimized metrics collection with Norwegian compliance
 */

import { createLogger } from '../../src/logger/index';
import { getMetricsCollector } from '../../src/metrics-sdk';

const logger = createLogger({ level: 'info' });

export class BrowserMetricsCollector {
  private baseCollector: any;
  private performanceObserver?: PerformanceObserver;

  constructor(config?: { municipality?: string; sampling?: number }) {
    this.baseCollector = getMetricsCollector();
    this.setupWebMetrics(config);
  }

  /**
   * Record performance metric with browser context
   */
  recordPerformance(operation: string, duration: number, metadata?: any) {
    const webMetadata = {
      ...metadata,
      platform: 'web',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      viewport:
        typeof window !== 'undefined'
          ? {
              width: window.innerWidth,
              height: window.innerHeight,
            }
          : null,
      connectionType: this.getConnectionType(),
      timestamp: new Date().toISOString(),
    };

    return this.baseCollector.recordPerformance(operation, duration, webMetadata);
  }

  /**
   * Record web-specific metrics
   */
  recordWebVitals() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    this.recordNavigationTiming();
    this.recordResourceTiming();
    this.setupPerformanceObserver();
  }

  /**
   * Record security event with browser context
   */
  recordSecurityEvent(event: string, metadata?: any) {
    const webSecurityMetadata = {
      ...metadata,
      platform: 'web',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
      referrer: typeof document !== 'undefined' ? document.referrer : 'unknown',
      timestamp: new Date().toISOString(),
    };

    return this.baseCollector.recordSecurityEvent(event, webSecurityMetadata);
  }

  /**
   * Record compliance event for Norwegian standards
   */
  recordComplianceEvent(event: string, metadata?: any) {
    const webComplianceMetadata = {
      ...metadata,
      platform: 'web',
      language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
      cookiesEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : false,
      timestamp: new Date().toISOString(),
    };

    return this.baseCollector.recordComplianceEvent(event, webComplianceMetadata);
  }

  private setupWebMetrics(_config?: any) {
    if (typeof window === 'undefined') return;

    // Setup automatic page view tracking
    this.recordPerformance('page.load', Date.now(), {
      url: window.location.href,
      title: document.title,
    });

    // Track unload events
    window.addEventListener('beforeunload', () => {
      this.recordPerformance('page.unload', Date.now(), {
        url: window.location.href,
      });
    });
  }

  private recordNavigationTiming() {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = window.performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.recordPerformance(
        'navigation.dns',
        navigation.domainLookupEnd - navigation.domainLookupStart
      );
      this.recordPerformance('navigation.connect', navigation.connectEnd - navigation.connectStart);
      this.recordPerformance(
        'navigation.response',
        navigation.responseEnd - navigation.responseStart
      );
      this.recordPerformance(
        'navigation.dom',
        navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      );
    }
  }

  private recordResourceTiming() {
    if (typeof window === 'undefined' || !window.performance) return;

    const resources = window.performance.getEntriesByType('resource');
    resources.forEach(resource => {
      this.recordPerformance('resource.load', resource.duration, {
        resourceType: (resource as PerformanceResourceTiming).initiatorType,
        resourceName: resource.name,
      });
    });
  }

  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      this.performanceObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.recordPerformance(`performance.${entry.entryType}`, entry.duration || 0, {
            name: entry.name,
            startTime: entry.startTime,
          });
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private getConnectionType(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }

  /**
   * Get collected web metrics
   */
  getWebMetrics() {
    return {
      performance: this.baseCollector.getMetrics(),
      webVitals: this.getWebVitals(),
      browser: this.getBrowserInfo(),
    };
  }

  private getWebVitals() {
    if (typeof window === 'undefined') return {};

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      connection: this.getConnectionType(),
      timing: window.performance ? window.performance.timing : null,
    };
  }

  private getBrowserInfo() {
    if (typeof navigator === 'undefined') return {};

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      platform: navigator.platform,
    };
  }
}

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

let performanceMetrics: PerformanceMetrics = {};
let observers: PerformanceObserver[] = [];

function collectWebVitals(): void {
  logger.info('📊 Starting Web Vitals collection');

  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    logger.warn('⚠️ Web Vitals collection not supported in this environment');
    return;
  }

  // Collect Largest Contentful Paint (LCP)
  collectLCP();

  // Collect First Input Delay (FID)
  collectFID();

  // Collect Cumulative Layout Shift (CLS)
  collectCLS();

  // Collect First Contentful Paint (FCP)
  collectFCP();

  // Collect Time to First Byte (TTFB)
  collectTTFB();

  logger.info('✅ Web Vitals collection initialized');
}

function collectLCP(): void {
  try {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        performanceMetrics.lcp = lastEntry.startTime;

        const vital: WebVital = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating:
            lastEntry.startTime <= 2500
              ? 'good'
              : lastEntry.startTime <= 4000
                ? 'needs-improvement'
                : 'poor',
          delta: lastEntry.startTime,
          entries: [lastEntry],
        };

        reportWebVital(vital);
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(observer);
  } catch (error) {
    logger.warn('⚠️ LCP collection failed', error);
  }
}

function collectFID(): void {
  try {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (entry.entryType === 'first-input') {
          const firstInputEntry = entry as PerformanceEventTiming;
          const fid = firstInputEntry.processingStart - firstInputEntry.startTime;

          performanceMetrics.fid = fid;

          const vital: WebVital = {
            name: 'FID',
            value: fid,
            rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor',
            delta: fid,
            entries: [entry],
          };

          reportWebVital(vital);
        }
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
    observers.push(observer);
  } catch (error) {
    logger.warn('⚠️ FID collection failed', error);
  }
}

function collectCLS(): void {
  try {
    let clsValue = 0;

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (entry.entryType === 'layout-shift') {
          const layoutShiftEntry = entry as PerformanceEntry & {
            value: number;
            hadRecentInput?: boolean;
          };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
      });

      performanceMetrics.cls = clsValue;

      const vital: WebVital = {
        name: 'CLS',
        value: clsValue,
        rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
        delta: clsValue,
        entries: entries,
      };

      reportWebVital(vital);
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    observers.push(observer);
  } catch (error) {
    logger.warn('⚠️ CLS collection failed', error);
  }
}

function collectFCP(): void {
  try {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          performanceMetrics.fcp = entry.startTime;

          const vital: WebVital = {
            name: 'FCP',
            value: entry.startTime,
            rating:
              entry.startTime <= 1800
                ? 'good'
                : entry.startTime <= 3000
                  ? 'needs-improvement'
                  : 'poor',
            delta: entry.startTime,
            entries: [entry],
          };

          reportWebVital(vital);
        }
      });
    });

    observer.observe({ type: 'paint', buffered: true });
    observers.push(observer);
  } catch (error) {
    logger.warn('⚠️ FCP collection failed', error);
  }
}

function collectTTFB(): void {
  try {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const ttfb = navEntry.responseStart - navEntry.requestStart;

          performanceMetrics.ttfb = ttfb;

          const vital: WebVital = {
            name: 'TTFB',
            value: ttfb,
            rating: ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor',
            delta: ttfb,
            entries: [entry],
          };

          reportWebVital(vital);
        }
      });
    });

    observer.observe({ type: 'navigation', buffered: true });
    observers.push(observer);
  } catch (error) {
    logger.warn('⚠️ TTFB collection failed', error);
  }
}

function setupPerformanceObservers(): void {
  logger.info('🔍 Setting up performance observers for monitoring web metrics');

  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    logger.warn('⚠️ PerformanceObserver not supported in this environment');
    return;
  }

  // Observe resource loading performance
  setupResourceObserver();

  // Observe long tasks
  setupLongTaskObserver();

  // Observe user interactions
  setupUserTimingObserver();

  logger.info('✅ Performance observers configured');
}

function setupResourceObserver(): void {
  try {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;

          // Track slow loading resources
          if (resourceEntry.duration > 1000) {
            logger.warn('🐌 Slow resource detected', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              type: resourceEntry.initiatorType,
            });
          }
        }
      });
    });

    observer.observe({ type: 'resource', buffered: true });
    observers.push(observer);
  } catch (error) {
    logger.warn('⚠️ Resource observer setup failed', error);
  }
}

function setupLongTaskObserver(): void {
  try {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (entry.entryType === 'longtask') {
          logger.warn('⏳ Long task detected', {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
    });

    observer.observe({ type: 'longtask', buffered: true });
    observers.push(observer);
  } catch (error) {
    logger.warn('⚠️ Long task observer setup failed', error);
  }
}

function setupUserTimingObserver(): void {
  try {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (entry.entryType === 'measure') {
          logger.info('📏 User timing measure', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
    });

    observer.observe({ type: 'measure', buffered: true });
    observers.push(observer);
  } catch (error) {
    logger.warn('⚠️ User timing observer setup failed', error);
  }
}

function reportWebVital(vital: WebVital): void {
  logger.info(`📊 Web Vital - ${vital.name}`, {
    value: vital.value,
    rating: vital.rating,
    delta: vital.delta,
  });

  // Report to analytics if configured
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', vital.name, {
      custom_parameter_value: vital.value,
      custom_parameter_rating: vital.rating,
    });
  }
}

export function setupWebMetrics(_config: any): void {
  logger.info('📊 Setting up web metrics collection');

  // Initialize web vitals collection
  collectWebVitals();

  // Setup performance observers
  setupPerformanceObservers();

  // Setup periodic reporting
  setupPeriodicReporting();

  logger.info('✅ Web metrics collection setup completed');
}

function setupPeriodicReporting(): void {
  // Report metrics every 30 seconds
  setInterval(() => {
    logger.info('📊 Current performance metrics', performanceMetrics);
  }, 30000);
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...performanceMetrics };
}

export function cleanup(): void {
  logger.info('🧹 Cleaning up performance observers');

  observers.forEach(observer => {
    observer.disconnect();
  });

  observers = [];
  performanceMetrics = {};
}
