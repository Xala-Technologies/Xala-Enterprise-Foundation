# Foundation Web Platform API Reference

The Foundation Web Platform provides browser-optimized implementations of Foundation modules with Norwegian government compliance, web-specific storage, analytics, and performance optimizations.

## 📖 Overview

The Foundation Web Platform extends the core Foundation package with:

- **Browser Storage** - LocalStorage/SessionStorage with NSM encryption
- **Web Analytics** - GDPR-compliant user behavior tracking
- **Performance Monitoring** - Web Vitals and compliance metrics
- **Progressive Web App** support with offline capabilities
- **ID-porten Web Integration** - Browser-based authentication flows
- **Accessibility** - WCAG 2.1 AA compliance for Norwegian government standards

## 🚀 Installation and Setup

### Installation

```bash
npm install @xala-technologies/foundation/web
```

### Basic Setup

```typescript
import { FoundationWebSetup } from '@xala-technologies/foundation/web';
import { foundationConfig } from './foundation.config';

// Initialize web platform
const webSetup = new FoundationWebSetup(foundationConfig);

// Start web application with Norwegian compliance
await webSetup.start();
```

### React Integration

```typescript
import React from 'react';
import { FoundationProvider } from '@xala-technologies/foundation/web';
import { foundationConfig } from './config/foundation.config';

function App() {
  return (
    <FoundationProvider config={foundationConfig}>
      <YourApplication />
    </FoundationProvider>
  );
}
```

## 📋 Core Web Platform APIs

### FoundationWebSetup

#### Constructor

```typescript
constructor(config: FoundationConfig, webOptions?: WebPlatformOptions)
```

#### WebPlatformOptions Interface

```typescript
interface WebPlatformOptions {
  enableServiceWorker?: boolean;
  enablePWA?: boolean;
  enableAnalytics?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableOfflineSupport?: boolean;
  cacheStrategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  maxCacheSize?: string;
  encryptLocalStorage?: boolean;
  enableWebVitals?: boolean;
}
```

#### Methods

##### start(): Promise\<void>

Initializes the web platform with all configured features.

```typescript
await webSetup.start();
```

##### configureStorage(storageConfig: WebStorageConfig): void

Configures browser storage with Norwegian compliance.

```typescript
webSetup.configureStorage({
  type: 'localStorage',
  encryption: true,
  nsmClassification: 'BEGRENSET',
  keyPrefix: 'oslo_citizen_portal_',
  maxStorageSize: '50MB',
  compressionEnabled: true,
});
```

##### configurePWA(pwaConfig: PWAConfig): void

Configures Progressive Web App features.

```typescript
webSetup.configurePWA({
  enabled: true,
  manifestPath: '/manifest.json',
  serviceWorkerPath: '/sw.js',
  offlinePages: ['/dashboard', '/services', '/profile'],
  cacheStrategy: 'stale-while-revalidate',
  updateStrategy: 'prompt',
});
```

### Web Storage Integration

#### FoundationWebStorage

Norwegian-compliant browser storage with encryption and NSM classification.

```typescript
import { FoundationWebStorage } from '@xala-technologies/foundation/web';

const storage = new FoundationWebStorage(foundationConfig);

// Store classified data
await storage.setItem('citizen_profile', citizenData, {
  nsmClassification: 'BEGRENSET',
  encrypt: true,
  expiresIn: '24h',
});

// Retrieve data with compliance validation
const profile = await storage.getItem('citizen_profile', {
  validateClassification: true,
  auditAccess: true,
});

// Store with GDPR compliance
await storage.setItemWithGDPR('user_preferences', preferences, {
  consentRequired: true,
  dataCategories: ['preferences', 'behavioral_data'],
  purpose: 'service_personalization',
  retentionPeriod: 'P1Y',
});
```

#### WebStorageConfig Interface

```typescript
interface WebStorageConfig {
  type: 'localStorage' | 'sessionStorage' | 'indexedDB';
  encryption: boolean;
  nsmClassification: NSMClassification;
  keyPrefix?: string;
  maxStorageSize?: string;
  compressionEnabled?: boolean;
  autoCleanup?: boolean;
  encryptionAlgorithm?: 'AES-256-GCM';
}
```

### Web Analytics Integration

#### FoundationWebAnalytics

GDPR-compliant web analytics with Norwegian government focus.

```typescript
import { FoundationWebAnalytics } from '@xala-technologies/foundation/web';

const analytics = new FoundationWebAnalytics(foundationConfig);

// Configure analytics with GDPR compliance
await analytics.configure({
  provider: 'foundation_analytics',
  trackingId: 'FA-OSLO-001',
  anonymizeData: true,
  respectDNT: true,
  consentRequired: true,
  municipalityTracking: true,
  accessibilityTracking: true,
});

// Track municipal service usage
await analytics.trackMunicipalService({
  serviceType: 'health_appointment_booking',
  municipality: '0301',
  department: 'health_services',
  outcome: 'appointment_booked',
  duration: 180000, // 3 minutes
  accessibility: {
    screenReader: false,
    keyboardNavigation: true,
    textSize: 'large',
  },
});

// Track page views with compliance
await analytics.trackPageView({
  page: '/services/health',
  title: 'Health Services - Oslo Kommune',
  municipality: '0301',
  classification: 'ÅPEN',
  personalDataPresent: false,
});

// Track user interactions
await analytics.trackEvent({
  category: 'citizen_services',
  action: 'form_submission',
  label: 'health_appointment_form',
  value: 1,
  municipality: '0301',
  nsmClassification: 'BEGRENSET',
});
```

### Performance Monitoring

#### FoundationWebPerformance

Web performance monitoring with Norwegian compliance and government standards.

```typescript
import { FoundationWebPerformance } from '@xala-technologies/foundation/web';

const performance = new FoundationWebPerformance(foundationConfig);

// Configure performance monitoring
await performance.configure({
  enableWebVitals: true,
  enableResourceTiming: true,
  enableNavigationTiming: true,
  enableCustomMetrics: true,
  reportingInterval: 30000, // 30 seconds
  complianceMonitoring: true,
});

// Track Core Web Vitals
await performance.trackWebVitals({
  municipality: '0301',
  serviceType: 'citizen_portal',
  userAgent: navigator.userAgent,
  connectionType: 'fast_3g',
});

// Track custom municipal performance metrics
await performance.trackCustomMetric({
  name: 'service_completion_time',
  value: 45000, // 45 seconds
  serviceType: 'health_appointment_booking',
  municipality: '0301',
  classification: 'BEGRENSET',
});

// Monitor accessibility performance
await performance.trackAccessibilityMetrics({
  focusManagement: true,
  keyboardNavigation: true,
  screenReaderCompatibility: true,
  colorContrast: 'AA',
  textScaling: 'responsive',
});
```

### Authentication Integration

#### FoundationWebAuth

Browser-specific authentication with ID-porten integration.

```typescript
import { FoundationWebAuth } from '@xala-technologies/foundation/web';

const webAuth = new FoundationWebAuth(foundationConfig);

// Configure ID-porten for web
await webAuth.configureIDPorten({
  clientId: process.env.REACT_APP_ID_PORTEN_CLIENT_ID,
  redirectUri: `${window.location.origin}/auth/callback`,
  scopes: ['openid', 'profile', 'krr:global/kontaktinformasjon.read'],
  responseType: 'code',
  codeChallenge: true, // PKCE for security
  ui_locales: 'nb nn en',
});

// Initiate authentication
const authUrl = await webAuth.getIDPortenAuthUrl({
  municipality: '0301',
  serviceLevel: 'substantial',
  prompt: 'login',
});

window.location.href = authUrl;

// Handle authentication callback
const tokens = await webAuth.handleIDPortenCallback(window.location.search);

// Get user profile
const userProfile = await webAuth.getUserProfile(tokens.access_token);
```

### React Hooks and Components

#### useFoundation Hook

```typescript
import { useFoundation } from '@xala-technologies/foundation/web';

function MyComponent() {
  const { logger, featureToggle, metrics, config } = useFoundation();

  const handleServiceAccess = async () => {
    await logger.info('Service accessed', { service: 'health_booking' });

    const isEnabled = await featureToggle.isEnabled('new_booking_system');
    if (isEnabled) {
      await metrics.trackEvent({
        eventType: 'feature_usage',
        feature: 'new_booking_system'
      });
    }
  };

  return (
    <button onClick={handleServiceAccess}>
      Book Health Appointment
    </button>
  );
}
```

#### useWebStorage Hook

```typescript
import { useWebStorage } from '@xala-technologies/foundation/web';

function UserPreferences() {
  const [preferences, setPreferences] = useWebStorage('user_preferences', {
    defaultValue: { language: 'nb-NO', theme: 'light' },
    nsmClassification: 'ÅPEN',
    encrypt: false
  });

  const updateLanguage = (language: string) => {
    setPreferences(prev => ({ ...prev, language }));
  };

  return (
    <div>
      <select value={preferences.language} onChange={(e) => updateLanguage(e.target.value)}>
        <option value="nb-NO">Norsk (Bokmål)</option>
        <option value="nn-NO">Norsk (Nynorsk)</option>
        <option value="en-US">English</option>
      </select>
    </div>
  );
}
```

#### useAnalytics Hook

```typescript
import { useAnalytics } from '@xala-technologies/foundation/web';

function ServicePage() {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView({
      page: '/services/health',
      municipality: '0301',
      classification: 'ÅPEN'
    });
  }, []);

  const trackFormSubmission = async () => {
    await analytics.trackEvent({
      category: 'forms',
      action: 'submission',
      label: 'health_appointment',
      municipality: '0301'
    });
  };

  return (
    <form onSubmit={trackFormSubmission}>
      {/* Form content */}
    </form>
  );
}
```

### Error Boundary Component

#### FoundationErrorBoundary

React error boundary with Norwegian compliance logging.

```typescript
import { FoundationErrorBoundary } from '@xala-technologies/foundation/web';

function App() {
  return (
    <FoundationErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        // Automatic error logging with compliance
      }}
      municipality="0301"
      classification="ÅPEN"
    >
      <YourApplication />
    </FoundationErrorBoundary>
  );
}

function ErrorFallback() {
  return (
    <div className="error-fallback">
      <h2>En feil oppstod</h2>
      <p>Vi beklager, men det oppstod en feil. Vennligst prøv igjen.</p>
    </div>
  );
}
```

## 🇳🇴 Norwegian Web Standards

### Accessibility Compliance

```typescript
import { FoundationWebAccessibility } from '@xala-technologies/foundation/web';

const accessibility = new FoundationWebAccessibility(foundationConfig);

// Configure WCAG 2.1 AA compliance
await accessibility.configure({
  level: 'AA',
  enableAutoFocus: true,
  enableSkipLinks: true,
  enableAriaLive: true,
  colorContrastRatio: 4.5,
  minimumTouchTarget: 44, // pixels
  supportKeyboardNavigation: true,
});

// Validate page accessibility
const accessibilityReport = await accessibility.validatePage({
  url: window.location.href,
  municipality: '0301',
  serviceType: 'citizen_portal',
});

// Track accessibility usage
await accessibility.trackUsage({
  feature: 'screen_reader',
  enabled: true,
  municipality: '0301',
});
```

### Norwegian Design System Integration

```typescript
import { FoundationNorwegianDesign } from '@xala-technologies/foundation/web';

const design = new FoundationNorwegianDesign(foundationConfig);

// Configure Norwegian government design system
await design.configure({
  designSystem: 'altinn_ds',
  municipality: '0301',
  customBranding: {
    primaryColor: '#0051A3', // Oslo blue
    secondaryColor: '#E6F3FF',
    fontFamily: 'Source Sans Pro, sans-serif',
  },
  components: {
    buttons: 'altinn-button',
    forms: 'altinn-form',
    navigation: 'altinn-nav',
  },
});
```

## 🔐 Security Features

### Content Security Policy

```typescript
import { FoundationWebSecurity } from '@xala-technologies/foundation/web';

const security = new FoundationWebSecurity(foundationConfig);

// Configure CSP for Norwegian compliance
await security.configureCSP({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", 'https://oidc.difi.no'],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'", 'https://api.oslo.kommune.no'],
  fontSrc: ["'self'", 'https://fonts.googleapis.com'],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  nsmClassification: 'BEGRENSET',
});
```

### Secure Communication

```typescript
// Configure secure API communication
await security.configureApiSecurity({
  enableCSRFProtection: true,
  enableTokenRefresh: true,
  tokenStorage: 'httpOnly_secure_cookie',
  apiTimeout: 30000,
  retryAttempts: 3,
  certificatePinning: process.env.NODE_ENV === 'production',
});
```

## 📱 Progressive Web App Features

### Service Worker Configuration

```typescript
import { FoundationServiceWorker } from '@xala-technologies/foundation/web';

const serviceWorker = new FoundationServiceWorker(foundationConfig);

// Configure PWA with Norwegian compliance
await serviceWorker.configure({
  cacheStrategy: 'stale-while-revalidate',
  cacheName: 'oslo-citizen-portal-v1',
  offlinePages: ['/dashboard', '/services', '/profile', '/notifications'],
  staticAssets: ['/assets/oslo-logo.svg', '/assets/norwegian-flag.svg'],
  apiCaching: {
    enabled: true,
    cacheTime: 300000, // 5 minutes
    excludeClassified: ['KONFIDENSIELT', 'HEMMELIG'],
  },
});

// Handle offline functionality
serviceWorker.onOffline(event => {
  logger.info('Application went offline', {
    municipality: '0301',
    timestamp: new Date().toISOString(),
  });
});

serviceWorker.onOnline(event => {
  logger.info('Application came online', {
    municipality: '0301',
    timestamp: new Date().toISOString(),
  });
});
```

## 🧪 Testing Web Components

### Web Platform Testing

```typescript
import { render, screen } from '@testing-library/react';
import { FoundationTestProvider } from '@xala-technologies/foundation/web/testing';
import { foundationConfig } from './test-config';

describe('Web Component Tests', () => {
  const renderWithFoundation = (component: React.ReactElement) => {
    return render(
      <FoundationTestProvider config={foundationConfig}>
        {component}
      </FoundationTestProvider>
    );
  };

  test('should track analytics on interaction', async () => {
    const mockAnalytics = jest.fn();

    renderWithFoundation(
      <ServiceButton
        onAnalytics={mockAnalytics}
        municipality="0301"
        service="health_booking"
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockAnalytics).toHaveBeenCalledWith({
      eventType: 'service_interaction',
      municipality: '0301',
      service: 'health_booking'
    });
  });

  test('should comply with accessibility standards', async () => {
    const { container } = renderWithFoundation(<ServiceForm />);

    const accessibilityResults = await axe(container);
    expect(accessibilityResults).toHaveNoViolations();
  });
});
```

## 📞 Support and Resources

### Related Documentation

- [Core API Reference](../README.md)
- [Mobile Platform API](./mobile.md)
- [Norwegian Compliance Guide](../compliance/norwegian-compliance.md)

### Code Examples

- [Oslo Citizen Portal](../../examples/municipal/oslo-citizen-portal/)
- [React Web Application](../../examples/platforms/web-applications/)

### Performance Optimization

- [Web Performance Guide](../../guides/web-performance.md)
- [Bundle Optimization](../../guides/bundle-optimization.md)

---

**Version**: 2.0.0  
**Compatibility**: Modern browsers, React 16.8+, TypeScript 4.9+  
**Compliance**: WCAG 2.1 AA, Norwegian Government Standards, GDPR
