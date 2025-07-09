// Global test setup
import { jest } from '@jest/globals';

// Mock browser globals for Node.js environment
const mockLocalStorage = new Map<string, string>();
const mockSessionStorage = new Map<string, string>();

(global as any).localStorage = {
  setItem: jest.fn((key: string, value: string) => mockLocalStorage.set(key, value)),
  getItem: jest.fn((key: string) => mockLocalStorage.get(key) || null),
  removeItem: jest.fn((key: string) => mockLocalStorage.delete(key)),
  clear: jest.fn(() => mockLocalStorage.clear()),
  length: mockLocalStorage.size,
  key: jest.fn((index: number) => Array.from(mockLocalStorage.keys())[index] || null),
};

(global as any).sessionStorage = {
  setItem: jest.fn((key: string, value: string) => mockSessionStorage.set(key, value)),
  getItem: jest.fn((key: string) => mockSessionStorage.get(key) || null),
  removeItem: jest.fn((key: string) => mockSessionStorage.delete(key)),
  clear: jest.fn(() => mockSessionStorage.clear()),
  length: mockSessionStorage.size,
  key: jest.fn((index: number) => Array.from(mockSessionStorage.keys())[index] || null),
};

// Mock window object
(global as any).window = {
  location: {
    href: 'https://test.kommune.no/test',
    pathname: '/test',
    search: '?lang=nb',
    hash: '',
    host: 'test.kommune.no',
    hostname: 'test.kommune.no',
    origin: 'https://test.kommune.no',
    port: '',
    protocol: 'https:',
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (Node.js) Test Environment',
    language: 'nb-NO',
    languages: ['nb-NO', 'nb', 'en'],
    cookieEnabled: true,
    onLine: true,
  },
  document: {
    title: 'Test Page',
    referrer: '',
    cookie: '',
    documentElement: {
      lang: 'nb-NO',
    },
    createElement: jest.fn((tagName: string) => ({
      tagName,
      name: '',
      content: '',
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
    })),
    head: {
      appendChild: jest.fn(),
    },
  },
  localStorage: (global as any).localStorage,
  sessionStorage: (global as any).sessionStorage,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  performance: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
  },
};

// Mock navigator
(global as any).navigator = (global as any).window.navigator;

// Mock performance API
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
  };
}

// Mock crypto for Node.js environment
if (typeof crypto === 'undefined') {
  const nodeCrypto = require('crypto');
  (global as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      const bytes = nodeCrypto.randomBytes(arr.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = bytes[i];
      }
      return arr;
    },
    randomUUID: () => nodeCrypto.randomUUID(),
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      digest: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
    },
  };
}

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = jest.fn((...args) => {
  // Only log actual errors, not expected test errors
  const message = args[0]?.toString() || '';
  if (
    !message.includes('Test error') &&
    !message.includes('Simulated') &&
    !message.includes('High-security error reported') &&
    !message.includes('Personal data error reported') &&
    !message.includes('❌ Web Foundation setup failed')
  ) {
    originalConsoleError(...args);
  }
});

console.warn = (...args: any[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    !message.includes('High-security error reported') &&
    !message.includes('Personal data error reported') &&
    !message.includes('Web Foundation setup failed') &&
    !message.includes('⚠️ PerformanceObserver not supported') &&
    !message.includes('Translation missing for key:') &&
    !message.includes('Locale') &&
    !message.includes('not registered, falling back to')
  ) {
    originalConsoleWarn(...args);
  }
};

// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.FOUNDATION_ENVIRONMENT = 'test';
process.env.FOUNDATION_MUNICIPALITY = '0301';
process.env.FOUNDATION_LANGUAGE = 'nb';
process.env.FOUNDATION_NSM_CLASSIFICATION = 'ÅPEN';
process.env.FOUNDATION_GDPR_ENABLED = 'true';
process.env.FOUNDATION_AUDIT_REQUIRED = 'true';

// Global test utilities
(global as any).testUtils = {
  // Helper to create Norwegian municipality test data
  createMunicipalityData: (municipalityCode: string) => ({
    code: municipalityCode,
    name:
      {
        '0301': 'Oslo',
        '4601': 'Bergen',
        '5001': 'Trondheim',
        '1103': 'Stavanger',
        '1601': 'Tromsø',
      }[municipalityCode] || 'Unknown',
    county:
      {
        '0301': 'Oslo',
        '4601': 'Vestland',
        '5001': 'Trøndelag',
        '1103': 'Rogaland',
        '1601': 'Troms og Finnmark',
      }[municipalityCode] || 'Unknown',
  }),

  // Helper to create Norwegian citizen test data
  createCitizenData: (citizenId: string) => ({
    citizenId,
    name: 'Ola Nordmann',
    socialSecurityNumber: '12345678901',
    address: 'Storgata 1, 0155 Oslo',
    municipality: '0301',
    language: 'nb',
  }),

  // Helper to create NSM classification test data
  createNSMClassificationData: (classification: string) => ({
    nsmClassification: classification,
    encryptionRequired: ['BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'].includes(classification),
    accessControlRequired: ['BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'].includes(classification),
    auditTrailRequired: ['KONFIDENSIELT', 'HEMMELIG'].includes(classification),
    securityClearanceRequired: classification === 'HEMMELIG',
  }),

  // Helper to create GDPR compliant test data
  createGDPRTestData: (personalDataInvolved: boolean) => ({
    personalDataInvolved,
    consentGiven: personalDataInvolved,
    consentDate: personalDataInvolved ? new Date().toISOString() : null,
    legalBasis: personalDataInvolved ? 'public_task' : null,
    retentionPeriod: personalDataInvolved ? 'P7Y' : null,
    dataMinimized: true,
  }),

  // Helper to clean up test data
  cleanupTestData: () => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    jest.clearAllMocks();
  },
};

// Global test hooks
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  mockLocalStorage.clear();
  mockSessionStorage.clear();
});

afterEach(() => {
  // Clean up after each test
  (global as any).testUtils.cleanupTestData();
});

// Global cleanup after all tests
afterAll(() => {
  // Clear any remaining timers
  jest.clearAllTimers();
  jest.useRealTimers();

  // Clean up global state
  jest.clearAllMocks();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Increase timeout for integration and performance tests
jest.setTimeout(60000);

export {};
