// Global setup that runs once before all tests
export default async function globalSetup() {
  console.log('🚀 Foundation Test Suite - Global Setup');

  // Set up test environment
  process.env.NODE_ENV = 'test';
  process.env.FOUNDATION_ENVIRONMENT = 'test';
  process.env.FOUNDATION_MUNICIPALITY = '0301';
  process.env.FOUNDATION_LANGUAGE = 'nb';
  process.env.FOUNDATION_NSM_CLASSIFICATION = 'ÅPEN';
  process.env.FOUNDATION_GDPR_ENABLED = 'true';
  process.env.FOUNDATION_AUDIT_REQUIRED = 'true';

  // Initialize test database or external dependencies if needed
  // For now, we're using in-memory testing

  // Set up test data directories
  const fs = require('fs');
  const path = require('path');

  const testDataDir = path.join(__dirname, '../test-data');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }

  // Create test municipalities data
  const municipalitiesData = [
    { code: '0301', name: 'Oslo', county: 'Oslo' },
    { code: '4601', name: 'Bergen', county: 'Vestland' },
    { code: '5001', name: 'Trondheim', county: 'Trøndelag' },
    { code: '1103', name: 'Stavanger', county: 'Rogaland' },
    { code: '1601', name: 'Tromsø', county: 'Troms og Finnmark' },
  ];

  fs.writeFileSync(
    path.join(testDataDir, 'municipalities.json'),
    JSON.stringify(municipalitiesData, null, 2)
  );

  // Create test Norwegian translations
  const norwegianTranslations = {
    nb: {
      'error.general': 'En feil oppstod',
      'error.validation': 'Valideringsfeil',
      'error.permission': 'Tilgangsfeil',
      'municipality.services': 'Kommunale tjenester',
      'citizen.portal': 'Innbyggerportal',
      'form.submit': 'Send inn',
      'accessibility.skip_to_content': 'Hopp til innhold',
      'accessibility.menu': 'Meny',
      'accessibility.search': 'Søk',
    },
    nn: {
      'error.general': 'Ein feil oppstod',
      'error.validation': 'Valideringsfeil',
      'error.permission': 'Tilgangsfeil',
      'municipality.services': 'Kommunale tenester',
      'citizen.portal': 'Innbyggjarportal',
      'form.submit': 'Send inn',
      'accessibility.skip_to_content': 'Hopp til innhald',
      'accessibility.menu': 'Meny',
      'accessibility.search': 'Søk',
    },
    en: {
      'error.general': 'An error occurred',
      'error.validation': 'Validation error',
      'error.permission': 'Permission error',
      'municipality.services': 'Municipal services',
      'citizen.portal': 'Citizen portal',
      'form.submit': 'Submit',
      'accessibility.skip_to_content': 'Skip to content',
      'accessibility.menu': 'Menu',
      'accessibility.search': 'Search',
    },
  };

  fs.writeFileSync(
    path.join(testDataDir, 'translations.json'),
    JSON.stringify(norwegianTranslations, null, 2)
  );

  // Create test NSM classification data
  const nsmClassifications = {
    ÅPEN: {
      level: 'ÅPEN',
      description: 'Public information',
      encryptionRequired: false,
      accessControlRequired: false,
      auditTrailRequired: false,
      securityClearanceRequired: false,
    },
    BEGRENSET: {
      level: 'BEGRENSET',
      description: 'Restricted information',
      encryptionRequired: true,
      accessControlRequired: true,
      auditTrailRequired: true,
      securityClearanceRequired: false,
    },
    KONFIDENSIELT: {
      level: 'KONFIDENSIELT',
      description: 'Confidential information',
      encryptionRequired: true,
      accessControlRequired: true,
      auditTrailRequired: true,
      securityClearanceRequired: false,
    },
    HEMMELIG: {
      level: 'HEMMELIG',
      description: 'Secret information',
      encryptionRequired: true,
      accessControlRequired: true,
      auditTrailRequired: true,
      securityClearanceRequired: true,
    },
  };

  fs.writeFileSync(
    path.join(testDataDir, 'nsm-classifications.json'),
    JSON.stringify(nsmClassifications, null, 2)
  );

  // Create test user data
  const testUsers = [
    {
      userId: 'citizen_001',
      name: 'Ola Nordmann',
      roles: ['citizen'],
      clearanceLevel: 'ÅPEN',
      municipality: '0301',
      language: 'nb',
    },
    {
      userId: 'employee_001',
      name: 'Kari Ansatt',
      roles: ['municipal_employee'],
      clearanceLevel: 'BEGRENSET',
      municipality: '0301',
      language: 'nb',
    },
    {
      userId: 'doctor_001',
      name: 'Dr. Erik Lege',
      roles: ['healthcare_professional', 'doctor'],
      clearanceLevel: 'KONFIDENSIELT',
      municipality: '0301',
      language: 'nb',
      additionalValidation: {
        licenseNumber: 'NO-DOC-12345',
        department: 'cardiology',
      },
    },
    {
      userId: 'security_officer_001',
      name: 'Siri Sikkerhet',
      roles: ['security_officer', 'intelligence_analyst'],
      clearanceLevel: 'HEMMELIG',
      municipality: '0301',
      language: 'nb',
      securityClearance: {
        level: 'HEMMELIG',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        backgroundCheckPassed: true,
      },
    },
  ];

  fs.writeFileSync(path.join(testDataDir, 'test-users.json'), JSON.stringify(testUsers, null, 2));

  // Create test feature flags
  const testFeatureFlags = [
    {
      id: 'public_services_portal',
      name: 'Public Services Portal',
      enabled: true,
      nsmClassification: 'ÅPEN',
      description: 'Access to public municipal services',
    },
    {
      id: 'employee_management',
      name: 'Employee Management System',
      enabled: true,
      nsmClassification: 'BEGRENSET',
      description: 'Access to employee records and management',
    },
    {
      id: 'health_records_system',
      name: 'Health Records Management',
      enabled: true,
      nsmClassification: 'KONFIDENSIELT',
      description: 'Access to citizen health records',
    },
    {
      id: 'classified_intelligence',
      name: 'Classified Intelligence System',
      enabled: true,
      nsmClassification: 'HEMMELIG',
      description: 'Access to classified intelligence data',
    },
  ];

  fs.writeFileSync(
    path.join(testDataDir, 'test-feature-flags.json'),
    JSON.stringify(testFeatureFlags, null, 2)
  );

  console.log('✅ Foundation Test Suite - Global Setup Complete');
  console.log(`📁 Test data created in: ${testDataDir}`);
  console.log(`🏛️  Municipality: ${process.env.FOUNDATION_MUNICIPALITY}`);
  console.log(`🌍 Language: ${process.env.FOUNDATION_LANGUAGE}`);
  console.log(`🔒 NSM Classification: ${process.env.FOUNDATION_NSM_CLASSIFICATION}`);
  console.log(`📋 GDPR Enabled: ${process.env.FOUNDATION_GDPR_ENABLED}`);
  console.log(`🔍 Audit Required: ${process.env.FOUNDATION_AUDIT_REQUIRED}`);
}
