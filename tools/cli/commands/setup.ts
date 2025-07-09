import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../../../src/logger/index.js';

const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});

export interface SetupOptions {
  platform: 'web' | 'mobile' | 'desktop' | 'api';
  municipality?: string;
  language: 'nb' | 'nn' | 'en';
  compliance: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
  dryRun?: boolean;
}

export async function setupFoundation(options: SetupOptions): Promise<void> {
  const { platform, municipality, language, compliance, dryRun } = options;

  logger.info('Setting up foundation', { platform, municipality, language, compliance });

  // Create foundation configuration
  const foundationConfig = {
    platform,
    municipality,
    language,
    compliance: {
      nsmClassification: compliance,
      gdprEnabled: true,
      auditRequired: true,
      retentionPeriod: 'P7Y',
    },
    modules: {
      logger: {
        enabled: true,
        level: 'info',
        nsmClassification: compliance,
      },
      errorHandler: {
        enabled: true,
        notifications: true,
        complianceChecks: true,
      },
      i18n: {
        enabled: true,
        defaultLanguage: language,
        supportedLanguages: ['nb', 'nn', 'en'],
      },
      healthcheck: {
        enabled: true,
        interval: 30000,
        complianceValidation: true,
      },
      metrics: {
        enabled: true,
        complianceTracking: true,
      },
    },
    security: {
      encryption: compliance !== 'ÅPEN',
      auditTrail: true,
      accessControl: compliance !== 'ÅPEN',
    },
    norwegian: {
      municipality,
      digdirIntegration: true,
      idPortenReady: true,
    },
  };

  // Generate TypeScript configuration
  const tsConfig = generateTsConfig(platform);

  // Generate example implementation
  const exampleCode = generateExampleCode(platform, foundationConfig);

  if (dryRun) {
    console.log('📋 Setup Plan (Dry Run)');
    console.log('   Files that would be created:');
    console.log('   - foundation.config.json');
    console.log('   - foundation.d.ts');
    console.log(`   - examples/${platform}-setup.ts`);
    console.log('   - package.json (dependencies updated)');
    console.log('\n   Configuration:');
    console.log(JSON.stringify(foundationConfig, null, 2));
    return;
  }

  // Create configuration files
  writeFileSync(
    join(process.cwd(), 'foundation.config.json'),
    JSON.stringify(foundationConfig, null, 2)
  );

  writeFileSync(join(process.cwd(), 'foundation.d.ts'), tsConfig);

  // Create examples directory
  const examplesDir = join(process.cwd(), 'examples');
  if (!existsSync(examplesDir)) {
    mkdirSync(examplesDir, { recursive: true });
  }

  writeFileSync(join(examplesDir, `${platform}-setup.ts`), exampleCode);

  // Update package.json dependencies
  await updatePackageJson(platform);

  console.log('✅ Foundation setup completed successfully');
  console.log(`   Platform: ${platform}`);
  console.log(`   Municipality: ${municipality || 'Not specified'}`);
  console.log(`   Language: ${language}`);
  console.log(`   Compliance: ${compliance}`);
  console.log('\n   Files created:');
  console.log('   - foundation.config.json');
  console.log('   - foundation.d.ts');
  console.log(`   - examples/${platform}-setup.ts`);
  console.log('\n   Next steps:');
  console.log('   1. Run: npm install');
  console.log(`   2. Import foundation in your ${platform} application`);
  console.log(`   3. Review examples/${platform}-setup.ts for implementation guidance`);
}

function generateTsConfig(platform: string): string {
  return `declare module '@xala-technologies/foundation' {
  export * from '@xala-technologies/foundation/dist/index';
}

declare module '@xala-technologies/foundation/${platform}' {
  export * from '@xala-technologies/foundation/dist/platforms/${platform}/index';
}

// Norwegian government types
declare namespace Norwegian {
  type Municipality = string; // Format: '0301' for Oslo
  type Language = 'nb' | 'nn' | 'en';
  type NSMClassification = 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
  
  interface ComplianceConfig {
    nsmClassification: NSMClassification;
    gdprEnabled: boolean;
    auditRequired: boolean;
    retentionPeriod: string;
  }
}`;
}

function generateExampleCode(platform: string, config: any): string {
  const platformImport =
    platform === 'web'
      ? 'setupWebFoundation'
      : platform === 'mobile'
        ? 'setupMobileFoundation'
        : platform === 'desktop'
          ? 'setupDesktopFoundation'
          : 'setupAPIFoundation';

  return `import { ${platformImport} } from '@xala-technologies/foundation/${platform}';

// Initialize foundation for ${platform} platform
const foundation = ${platformImport}({
  municipality: '${config.municipality || '0301'}', // Oslo
  language: '${config.language}',
  compliance: {
    nsmClassification: '${config.compliance.nsmClassification}',
    gdprEnabled: ${config.compliance.gdprEnabled},
    auditRequired: ${config.compliance.auditRequired},
    retentionPeriod: '${config.compliance.retentionPeriod}'
  },
  modules: {
    logger: {
      enabled: true,
      level: 'info',
      nsmClassification: '${config.compliance.nsmClassification}'
    },
    errorHandler: {
      enabled: true,
      notifications: true,
      complianceChecks: true
    },
    i18n: {
      enabled: true,
      defaultLanguage: '${config.language}',
      supportedLanguages: ['nb', 'nn', 'en']
    },
    healthcheck: {
      enabled: true,
      interval: 30000,
      complianceValidation: true
    },
    metrics: {
      enabled: true,
      complianceTracking: true
    }
  }
});

// Example usage
async function main() {
  try {
    await foundation.initialize();
    
    // Use foundation logger
    const logger = foundation.getLogger();
    logger.info('Foundation initialized successfully for ${platform}');
    
    // Example ${platform} specific features
    ${generatePlatformSpecificExample(platform)}
    
  } catch (error) {
    console.error('Foundation initialization failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);`;
}

function generatePlatformSpecificExample(platform: string): string {
  switch (platform) {
    case 'web':
      return `// Web-specific features
    const webStorage = foundation.getWebStorage();
    await webStorage.setItem('user-preference', 'dark-mode');
    
    // Web analytics
    const webAnalytics = foundation.getWebAnalytics();
    webAnalytics.trackEvent('user_action', { action: 'foundation_initialized' });`;

    case 'mobile':
      return `// Mobile-specific features
    const mobileStorage = foundation.getMobileStorage();
    await mobileStorage.setItem('app-state', { lastSync: new Date() });
    
    // Offline support
    const offlineQueue = foundation.getOfflineQueue();
    await offlineQueue.enqueue({ type: 'sync_data', data: {} });`;

    case 'desktop':
      return `// Desktop-specific features
    const desktopStorage = foundation.getDesktopStorage();
    await desktopStorage.setItem('window-state', { x: 100, y: 100 });
    
    // IPC communication
    const ipcBridge = foundation.getIPCBridge();
    ipcBridge.send('main-process', { type: 'foundation_ready' });`;

    case 'api':
      return `// API-specific features
    const apiMetrics = foundation.getAPIMetrics();
    apiMetrics.startRequest('GET', '/api/citizens');
    
    // Distributed events
    const distributedEvents = foundation.getDistributedEvents();
    distributedEvents.publish('citizen.registered', { citizenId: '123' });`;

    default:
      return '// Platform-specific features will be added here';
  }
}

async function updatePackageJson(platform: string): Promise<void> {
  const packagePath = join(process.cwd(), 'package.json');

  try {
    const packageContent = JSON.parse(require('fs').readFileSync(packagePath, 'utf-8'));

    if (!packageContent.dependencies) {
      packageContent.dependencies = {};
    }

    packageContent.dependencies['@xala-technologies/foundation'] = '^2.0.0';

    // Add platform-specific dependencies
    if (platform === 'web') {
      packageContent.dependencies['commander'] = '^9.4.0';
    } else if (platform === 'mobile') {
      packageContent.dependencies['react-native'] = '^0.72.0';
    } else if (platform === 'desktop') {
      packageContent.dependencies['electron'] = '^22.0.0';
    }

    require('fs').writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
  } catch (error) {
    logger.warn('Could not update package.json', {
      error: error instanceof Error ? error.message : error,
    });
  }
}
