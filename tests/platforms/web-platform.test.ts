import { setupWebFoundation } from '../../platforms/web/index.js';

// Mock browser environment
const mockLocalStorage = new Map<string, string>();
const mockSessionStorage = new Map<string, string>();

(global as any).localStorage = {
  setItem: (key: string, value: string) => mockLocalStorage.set(key, value),
  getItem: (key: string) => mockLocalStorage.get(key) || null,
  removeItem: (key: string) => mockLocalStorage.delete(key),
  clear: () => mockLocalStorage.clear(),
  length: mockLocalStorage.size,
  key: (index: number) => Array.from(mockLocalStorage.keys())[index] || null,
};

(global as any).sessionStorage = {
  setItem: (key: string, value: string) => mockSessionStorage.set(key, value),
  getItem: (key: string) => mockSessionStorage.get(key) || null,
  removeItem: (key: string) => mockSessionStorage.delete(key),
  clear: () => mockSessionStorage.clear(),
  length: mockSessionStorage.size,
  key: (index: number) => Array.from(mockSessionStorage.keys())[index] || null,
};

// Mock window and navigator
(global as any).window = {
  location: {
    href: 'https://oslo.kommune.no/test',
    pathname: '/test',
    search: '?lang=nb',
  },
  navigator: {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    language: 'nb-NO',
  },
};

(global as any).navigator = (global as any).window.navigator;

describe('Web Platform Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  });

  describe('Web Foundation Setup', () => {
    it('should initialize web foundation with Norwegian municipality', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301', // Oslo
        language: 'nb',
        compliance: {
          nsmClassification: 'ÅPEN',
          gdprEnabled: true,
          auditRequired: true,
          retentionPeriod: 'P7Y',
        },
        modules: {
          webStorage: { enabled: true, localStorage: true, sessionStorage: true },
          webLogger: { enabled: true, browserContext: true },
          webEvents: { enabled: true, analytics: true },
        },
      });

      expect(webFoundation).toBeDefined();
      expect(webFoundation.platform).toBe('web');
      expect(webFoundation.municipality).toBe('0301');
      expect(webFoundation.language).toBe('nb');
    });

    it('should configure web-specific modules', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '4601', // Bergen
        language: 'nb',
        modules: {
          webStorage: {
            enabled: true,
            localStorage: true,
            compliance: {
              encryptSensitiveData: true,
              auditAccess: true,
            },
          },
          webLogger: {
            enabled: true,
            browserContext: true,
            includeUserAgent: true,
            includeUrl: true,
          },
          webAnalytics: {
            enabled: true,
            trackPageViews: true,
            trackUserInteractions: true,
            complianceMode: true,
          },
        },
      });

      expect(webFoundation.modules.webStorage).toBeDefined();
      expect(webFoundation.modules.webLogger).toBeDefined();
      expect(webFoundation.modules.webAnalytics).toBeDefined();
    });
  });

  describe('Web Storage Integration', () => {
    it('should store and retrieve data with compliance metadata', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webStorage: { enabled: true, localStorage: true },
        },
      });

      const storage = webFoundation.getWebStorage();

      // Store user preference
      await storage.setItem('user-theme', 'dark', {
        nsmClassification: 'ÅPEN',
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
        auditRequired: false,
      });

      // Retrieve user preference
      const theme = await storage.getItem('user-theme');
      expect(theme.value).toBe('dark');
      expect(theme.metadata.nsmClassification).toBe('ÅPEN');
    });

    it('should handle sensitive data storage with encryption', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webStorage: {
            enabled: true,
            localStorage: true,
            compliance: { encryptSensitiveData: true },
          },
        },
      });

      const storage = webFoundation.getWebStorage();

      // Store sensitive user data
      await storage.setItem(
        'user-profile',
        {
          name: 'Ola Nordmann',
          socialSecurityNumber: '12345678901',
          address: 'Storgata 1, 0155 Oslo',
        },
        {
          nsmClassification: 'KONFIDENSIELT',
          personalDataInvolved: true,
          auditRequired: true,
          retentionPeriod: 'P7Y',
        }
      );

      const profile = await storage.getItem('user-profile');
      expect(profile.value.name).toBe('Ola Nordmann');
      expect(profile.metadata.personalDataInvolved).toBe(true);
      expect(profile.metadata.encrypted).toBe(true);
    });

    it('should respect GDPR data retention policies', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webStorage: { enabled: true, localStorage: true },
        },
      });

      const storage = webFoundation.getWebStorage();

      // Store data with short retention period
      await storage.setItem('temp-data', 'temporary value', {
        nsmClassification: 'ÅPEN',
        expiresAt: new Date(Date.now() - 1000), // Already expired
        auditRequired: false,
      });

      // Should return null for expired data
      const expiredData = await storage.getItem('temp-data');
      expect(expiredData).toBeNull();
    });
  });

  describe('Web Logger Integration', () => {
    it('should log with browser context information', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webLogger: {
            enabled: true,
            browserContext: true,
            includeUserAgent: true,
            includeUrl: true,
          },
        },
      });

      const logger = webFoundation.getWebLogger();

      // Log with automatic browser context
      logger.info('User action performed', {
        action: 'button_click',
        component: 'navigation_menu',
      });

      // Logger should automatically include browser context
      expect(logger.getContext()).toMatchObject({
        userAgent: expect.stringContaining('Chrome'),
        url: 'https://oslo.kommune.no/test',
        language: 'nb-NO',
      });
    });

    it('should handle Norwegian municipal logging requirements', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '4601', // Bergen
        language: 'nb',
        modules: {
          webLogger: { enabled: true, browserContext: true },
        },
      });

      const logger = webFoundation.getWebLogger();

      // Log municipal service access
      logger.audit('Municipal service accessed', {
        service: 'health_records',
        citizenId: 'NO-12345678901',
        municipality: '4601',
        nsmClassification: 'KONFIDENSIELT',
        gdprApplies: true,
      });

      expect(logger.getAuditTrail()).toContainEqual(
        expect.objectContaining({
          message: 'Municipal service accessed',
          service: 'health_records',
          municipality: '4601',
        })
      );
    });
  });

  describe('Web Analytics Integration', () => {
    it('should track page views with Norwegian compliance', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webAnalytics: {
            enabled: true,
            trackPageViews: true,
            complianceMode: true,
          },
        },
      });

      const analytics = webFoundation.getWebAnalytics();

      // Track page view
      analytics.trackPageView('/tjenester/helse', {
        title: 'Helsetjenester - Oslo Kommune',
        language: 'nb',
        municipality: '0301',
      });

      const pageViews = analytics.getPageViews();
      expect(pageViews).toContainEqual(
        expect.objectContaining({
          path: '/tjenester/helse',
          title: 'Helsetjenester - Oslo Kommune',
          municipality: '0301',
        })
      );
    });

    it('should track user interactions without PII', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webAnalytics: {
            enabled: true,
            trackUserInteractions: true,
            complianceMode: true,
            anonymizeData: true,
          },
        },
      });

      const analytics = webFoundation.getWebAnalytics();

      // Track button click (anonymized)
      analytics.trackEvent('button_click', {
        component: 'service_application_form',
        action: 'submit',
        category: 'municipal_services',
      });

      const events = analytics.getEvents();
      expect(events).toContainEqual(
        expect.objectContaining({
          event: 'button_click',
          component: 'service_application_form',
          action: 'submit',
        })
      );

      // Ensure no PII is tracked
      events.forEach(event => {
        expect(event).not.toHaveProperty('personalData');
        expect(event).not.toHaveProperty('citizenId');
        expect(event).not.toHaveProperty('socialSecurityNumber');
      });
    });
  });

  describe('Web Performance Testing', () => {
    it('should measure web vitals and performance metrics', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webMetrics: {
            enabled: true,
            measureWebVitals: true,
            measurePerformance: true,
          },
        },
      });

      const metrics = webFoundation.getWebMetrics();

      // Simulate web vitals measurements
      metrics.recordWebVital('LCP', 1200); // Largest Contentful Paint
      metrics.recordWebVital('FID', 50); // First Input Delay
      metrics.recordWebVital('CLS', 0.1); // Cumulative Layout Shift

      const webVitals = metrics.getWebVitals();
      expect(webVitals.LCP).toBe(1200);
      expect(webVitals.FID).toBe(50);
      expect(webVitals.CLS).toBe(0.1);
    });

    it('should monitor Norwegian municipal website performance', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '5001', // Trondheim
        language: 'nb',
        modules: {
          webMetrics: { enabled: true, measurePerformance: true },
        },
      });

      const metrics = webFoundation.getWebMetrics();

      // Measure page load performance
      const startTime = performance.now();

      // Simulate page rendering
      await new Promise(resolve => setTimeout(resolve, 10));

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      metrics.recordPerformanceMetric('page_load_time', loadTime, {
        page: '/tjenester',
        municipality: '5001',
        nsmClassification: 'ÅPEN',
      });

      const performanceMetrics = metrics.getPerformanceMetrics();
      expect(performanceMetrics).toContainEqual(
        expect.objectContaining({
          metric: 'page_load_time',
          value: expect.any(Number),
          municipality: '5001',
        })
      );
    });
  });

  describe('Web Accessibility Testing', () => {
    it('should support Norwegian accessibility requirements', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webAccessibility: {
            enabled: true,
            wcagLevel: 'AA',
            norwegianStandards: true,
          },
        },
      });

      const accessibility = webFoundation.getWebAccessibility();

      // Check WCAG compliance
      const wcagCheck = accessibility.checkWCAGCompliance({
        hasAltText: true,
        hasProperHeadings: true,
        hasKeyboardNavigation: true,
        hasAriaLabels: true,
        hasColorContrast: true,
      });

      expect(wcagCheck.compliant).toBe(true);
      expect(wcagCheck.level).toBe('AA');
    });

    it('should provide Norwegian language accessibility features', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webAccessibility: { enabled: true },
          i18n: { enabled: true, supportedLanguages: ['nb', 'nn', 'en'] },
        },
      });

      const accessibility = webFoundation.getWebAccessibility();
      const i18n = webFoundation.getI18n();

      // Add Norwegian accessibility translations
      i18n.addTranslations('nb', {
        'accessibility.skip_to_content': 'Hopp til innhold',
        'accessibility.menu': 'Meny',
        'accessibility.search': 'Søk',
      });

      const skipToContent = i18n.t('accessibility.skip_to_content');
      expect(skipToContent).toBe('Hopp til innhold');
    });
  });

  describe('Web Security Testing', () => {
    it('should implement CSP and security headers', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        modules: {
          webSecurity: {
            enabled: true,
            contentSecurityPolicy: true,
            securityHeaders: true,
          },
        },
      });

      const security = webFoundation.getWebSecurity();

      const csp = security.generateCSP({
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.oslo.kommune.no'],
      });

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("connect-src 'self' https://api.oslo.kommune.no");
    });

    it('should validate Norwegian government security requirements', async () => {
      const webFoundation = setupWebFoundation({
        municipality: '0301',
        language: 'nb',
        compliance: {
          nsmClassification: 'BEGRENSET',
          gdprEnabled: true,
          auditRequired: true,
        },
        modules: {
          webSecurity: { enabled: true, nsmCompliant: true },
        },
      });

      const security = webFoundation.getWebSecurity();

      const securityCheck = security.validateNSMCompliance({
        httpsOnly: true,
        secureHeaders: true,
        inputValidation: true,
        outputEncoding: true,
        sessionSecurity: true,
      });

      expect(securityCheck.compliant).toBe(true);
      expect(securityCheck.nsmLevel).toBe('BEGRENSET');
    });
  });
});
