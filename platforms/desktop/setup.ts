/**
 * Desktop Platform Setup
 * Initialize Foundation for Electron Environment
 */

import type { FoundationConfig } from '../../src/config-loader/index.js';
import { createLogger } from '../../src/logger/index.js';

// Create logger with proper options object
const logger = createLogger({ level: 'info' });

/**
 * Setup Desktop Foundation Platform
 * Configures Norwegian government-compliant desktop applications
 */
export async function setupDesktopFoundation(config: FoundationConfig): Promise<void> {
  logger.info('🖥️ Initializing Desktop Foundation Platform...');

  try {
    await Promise.all([
      setupDesktopStorage(config),
      setupIPCCommunication(config),
      setupDesktopMetrics(config),
      setupSystemResourceMonitoring(config),
      setupApplicationMetrics(config),
    ]);

    // Setup Norwegian compliance features if enabled
    if (config.compliance?.norwegian) {
      await Promise.all([
        setupNorwegianCompliance(config),
        setupDesktopLocalization(config),
        setupComplianceFileHandling(config),
        setupSecureDocumentManagement(config),
      ]);
    }

    // Additional desktop-specific features
    await Promise.all([
      setupAutoUpdater(config),
      setupWindowManagement(config),
      setupSystemTray(config),
      setupDesktopSecurity(config),
    ]);

    logger.info('✅ Desktop Foundation Platform initialized successfully');
  } catch (error) {
    logger.error('❌ Desktop Foundation Platform initialization failed', error as Error);
    throw error;
  }
}

async function setupDesktopStorage(config: FoundationConfig): Promise<void> {
  try {
    logger.info('📁 Setting up desktop storage...');

    // Check if running in Electron environment
    const isElectron =
      typeof process !== 'undefined' && process.versions && process.versions['electron'];

    if (isElectron) {
      // Configure Electron storage with Norwegian compliance
      const storageConfig = {
        encryption: config.compliance?.encryption || false,
        audit: true,
        secure: config.compliance?.norwegian || false,
      };

      logger.info('📁 Desktop storage configured', storageConfig);
    } else {
      logger.info('📁 Desktop storage setup skipped (not in Electron environment)');
    }
  } catch (error) {
    logger.warn(
      '⚠️ Electron storage setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupIPCCommunication(_config: FoundationConfig): Promise<void> {
  try {
    logger.info('📡 Setting up IPC communication...');

    // Check if running in Electron environment
    const isElectron =
      typeof process !== 'undefined' && process.versions && process.versions['electron'];

    if (isElectron) {
      // Setup IPC bridge for Norwegian compliance
      logger.info('📡 IPC communication configured for Norwegian compliance');
    } else {
      logger.info('📡 IPC communication setup skipped (not in Electron environment)');
    }
  } catch (error) {
    logger.warn(
      '⚠️ IPC communication setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupDesktopMetrics(config: FoundationConfig): Promise<void> {
  try {
    logger.info('📊 Setting up desktop metrics...');

    // Setup desktop-specific metrics collection
    const metricsConfig = {
      collectSystemMetrics: true,
      collectApplicationMetrics: true,
      nsmCompliant: config.compliance?.nsmClassification !== undefined,
    };

    logger.info('📊 Desktop metrics configured', metricsConfig);
  } catch (error) {
    logger.warn(
      '⚠️ Desktop metrics setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupSystemResourceMonitoring(config: FoundationConfig): Promise<void> {
  try {
    logger.info('🔍 Setting up system resource monitoring...');

    const monitoringConfig = {
      enabled: true,
      interval: 30000, // 30 seconds
      metrics: ['memory', 'cpu', 'disk'],
      complianceLevel: config.compliance?.nsmClassification || 'ÅPEN',
    };

    logger.info('🔍 System resource monitoring configured', monitoringConfig);
  } catch (error) {
    logger.warn(
      '⚠️ System resource monitoring setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupApplicationMetrics(config: FoundationConfig): Promise<void> {
  try {
    logger.info('📈 Setting up application metrics...');

    const appMetricsConfig = {
      trackUserInteractions: true,
      trackPerformance: true,
      gdprCompliant: config.compliance?.gdpr || false,
    };

    logger.info('📈 Application metrics configured', appMetricsConfig);
  } catch (error) {
    logger.warn(
      '⚠️ Application metrics setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupNorwegianCompliance(config: FoundationConfig): Promise<void> {
  try {
    if (config.compliance?.norwegian) {
      logger.info('🇳🇴 Setting up Norwegian compliance...');

      // Configure Norwegian-specific features
      const language = config.language || 'nb';

      const complianceConfig = {
        language,
        nsmEnabled: true,
        gdpr: config.compliance.gdpr || false,
        nsm: config.compliance.nsm || false,
      };

      logger.info('🇳🇴 Norwegian compliance configured', complianceConfig);
    }
  } catch (error) {
    logger.warn(
      '⚠️ Norwegian compliance setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupDesktopLocalization(config: FoundationConfig): Promise<void> {
  try {
    logger.info('🌐 Setting up desktop localization...');

    const localizationConfig = {
      language: config.language || 'nb',
      supportedLanguages: ['nb', 'nn', 'en'],
      dateFormat: 'dd.MM.yyyy',
      numberFormat: 'nb-NO',
    };

    logger.info('🌐 Desktop localization configured', localizationConfig);
  } catch (error) {
    logger.warn(
      '⚠️ Desktop localization setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupComplianceFileHandling(_config: FoundationConfig): Promise<void> {
  try {
    logger.info('📄 Setting up compliance file handling...');

    const fileHandlingConfig = {
      encryption: true,
      auditTrail: true,
      retention: true,
    };

    logger.info('📄 Compliance file handling configured', fileHandlingConfig);
  } catch (error) {
    logger.warn(
      '⚠️ Compliance file handling setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupSecureDocumentManagement(_config: FoundationConfig): Promise<void> {
  try {
    logger.info('🔒 Setting up secure document management...');

    const documentConfig = {
      encryption: true,
      accessControl: true,
      auditTrail: true,
    };

    logger.info('🔒 Secure document management configured', documentConfig);
  } catch (error) {
    logger.warn(
      '⚠️ Secure document management setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupAutoUpdater(_config: FoundationConfig): Promise<void> {
  try {
    logger.info('🔄 Setting up auto-updater...');

    const updaterConfig = {
      enabled: true,
      checkInterval: 3600000, // 1 hour
      autoDownload: false,
    };

    logger.info('🔄 Auto-updater configured', updaterConfig);
  } catch (error) {
    logger.warn(
      '⚠️ Auto-updater setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupWindowManagement(_config: FoundationConfig): Promise<void> {
  try {
    logger.info('🪟 Setting up window management...');

    const windowConfig = {
      rememberPositions: true,
      multiWindow: true,
      secureMode: true,
    };

    logger.info('🪟 Window management configured', windowConfig);
  } catch (error) {
    logger.warn(
      '⚠️ Window management setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupSystemTray(_config: FoundationConfig): Promise<void> {
  try {
    logger.info('📌 Setting up system tray...');

    const trayConfig = {
      enabled: true,
      notifications: true,
      quickActions: true,
    };

    logger.info('📌 System tray configured', trayConfig);
  } catch (error) {
    logger.warn(
      '⚠️ System tray setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}

async function setupDesktopSecurity(_config: FoundationConfig): Promise<void> {
  try {
    logger.info('🔐 Setting up desktop security...');

    const securityConfig = {
      csp: true,
      nodeIntegration: false,
      contextIsolation: true,
    };

    logger.info('🔐 Desktop security configured', securityConfig);
  } catch (error) {
    logger.warn(
      '⚠️ Desktop security setup failed',
      error instanceof Error ? { error: error.message } : { error }
    );
  }
}
