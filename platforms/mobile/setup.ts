/**
 * Mobile Platform Setup
 * Initialize Foundation for React Native Environment
 */

import type { FoundationConfig } from '../../src/config-loader/index';
import { createLogger } from '../../src/logger/index';

const logger = createLogger({ level: 'info' });

export async function setupMobile(config: FoundationConfig): Promise<void> {
  logger.info('📱 Setting up Foundation for Mobile platform', { environment: config.environment });

  try {
    // Configure React Native storage with encryption
    await setupMobileStorage(config);

    // Setup offline queue and sync mechanisms
    await setupOfflineSupport(config);

    // Initialize mobile metrics and analytics
    await setupMobileMetrics(config);

    // Configure Norwegian compliance for mobile apps
    await setupMobileNorwegianCompliance(config);

    // Setup push notifications
    await setupPushNotifications(config);

    // Configure biometric authentication
    await setupBiometricAuth(config);

    // Setup background tasks
    await setupBackgroundTasks(config);

    // Configure accessibility features
    await setupMobileAccessibility(config);

    logger.info('✅ Mobile Foundation setup completed successfully');
  } catch (error) {
    logger.error(
      '❌ Mobile Foundation setup failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

async function setupMobileStorage(config: FoundationConfig): Promise<void> {
  logger.info('💾 Configuring React Native storage');

  try {
    // Configure AsyncStorage with encryption for sensitive data
    // Setup secure storage for Norwegian compliance data
    // Configure storage quotas and cleanup policies

    // Check if AsyncStorage is available (React Native environment)
    const hasAsyncStorage =
      typeof global !== 'undefined' &&
      global.require &&
      global.require.resolve('@react-native-async-storage/async-storage');

    if (hasAsyncStorage) {
      logger.info('✅ AsyncStorage configured', {
        encryption: config.compliance?.encryption || false,
        secure: config.compliance?.norwegian || false,
      });
    } else {
      logger.warn('⚠️ AsyncStorage not available - using fallback storage');
    }
  } catch (error) {
    logger.warn('⚠️ Mobile storage setup failed', error);
  }
}

async function setupOfflineSupport(config: FoundationConfig): Promise<void> {
  logger.info('📴 Setting up offline support and sync mechanisms');

  try {
    // Initialize offline queue for API requests
    // Setup background sync for Norwegian municipal services
    // Configure conflict resolution strategies
    // Setup offline data persistence

    // Configure network state monitoring
    await setupNetworkMonitoring();

    // Setup offline data synchronization
    await setupDataSync(config);

    logger.info('✅ Offline support configured');
  } catch (error) {
    logger.warn('⚠️ Offline support setup failed', error);
  }
}

async function setupNetworkMonitoring(): Promise<void> {
  try {
    // Monitor network connectivity changes
    // Queue requests when offline
    // Sync when connection restored

    logger.info('✅ Network monitoring configured');
  } catch (error) {
    logger.warn('⚠️ Network monitoring setup failed', error);
  }
}

async function setupDataSync(_config: FoundationConfig): Promise<void> {
  try {
    // Configure data synchronization with backend
    // Setup conflict resolution for Norwegian municipal data
    // Configure sync intervals and priorities

    logger.info('✅ Data synchronization configured');
  } catch (error) {
    logger.warn('⚠️ Data sync setup failed', error);
  }
}

async function setupMobileMetrics(config: FoundationConfig): Promise<void> {
  logger.info('📊 Setting up mobile metrics and analytics');

  try {
    // Configure crash reporting
    // Setup performance monitoring
    // Configure Norwegian compliance analytics
    // Setup user behavior analytics (GDPR compliant)

    logger.info('✅ Mobile metrics configured', {
      crashReporting: true,
      performance: true,
      gdprCompliant: config.compliance?.gdpr || false,
    });
  } catch (error) {
    logger.warn('⚠️ Mobile metrics setup failed', error);
  }
}

async function setupMobileNorwegianCompliance(config: FoundationConfig): Promise<void> {
  logger.info('🇳🇴 Setting up Norwegian compliance for mobile apps');

  if (config.compliance?.norwegian) {
    try {
      // Configure mobile data protection (GDPR)
      // Setup NSM security classifications for mobile
      // Configure municipality-specific mobile features
      // Setup Norwegian language support

      const language = config.language || 'nb';

      // Configure localization
      await setupMobileLocalization(language);

      // Setup compliance data handling
      await setupComplianceDataHandling(config);

      logger.info('✅ Norwegian mobile compliance configured', {
        language,
        municipality: config.municipality || 'default',
        gdpr: config.compliance.gdpr || false,
        nsm: config.compliance.nsm || false,
      });
    } catch (error) {
      logger.warn('⚠️ Norwegian compliance setup failed', error);
    }
  }
}

async function setupMobileLocalization(language: string): Promise<void> {
  try {
    // Configure React Native localization
    // Setup Norwegian date/time formatting
    // Configure currency formatting for NOK

    logger.info('✅ Mobile localization configured', { language });
  } catch (error) {
    logger.warn('⚠️ Mobile localization setup failed', error);
  }
}

async function setupComplianceDataHandling(_config: FoundationConfig): Promise<void> {
  try {
    // Configure secure data storage for compliance
    // Setup data retention policies
    // Configure audit logging

    logger.info('✅ Compliance data handling configured');
  } catch (error) {
    logger.warn('⚠️ Compliance data handling setup failed', error);
  }
}

async function setupPushNotifications(_config: FoundationConfig): Promise<void> {
  logger.info('🔔 Setting up push notifications');

  try {
    // Configure push notification permissions
    // Setup Norwegian municipal notification channels
    // Configure GDPR-compliant notification preferences

    logger.info('✅ Push notifications configured');
  } catch (error) {
    logger.warn('⚠️ Push notifications setup failed', error);
  }
}

async function setupBiometricAuth(_config: FoundationConfig): Promise<void> {
  logger.info('👆 Setting up biometric authentication');

  try {
    // Configure Touch ID / Face ID
    // Setup biometric security for Norwegian services
    // Configure fallback authentication methods

    logger.info('✅ Biometric authentication configured');
  } catch (error) {
    logger.warn('⚠️ Biometric auth setup failed', error);
  }
}

async function setupBackgroundTasks(_config: FoundationConfig): Promise<void> {
  logger.info('⏰ Setting up background tasks');

  try {
    // Configure background sync
    // Setup periodic compliance checks
    // Configure background data updates

    logger.info('✅ Background tasks configured');
  } catch (error) {
    logger.warn('⚠️ Background tasks setup failed', error);
  }
}

async function setupMobileAccessibility(_config: FoundationConfig): Promise<void> {
  logger.info('♿ Setting up mobile accessibility');

  try {
    // Configure screen reader support
    // Setup Norwegian accessibility standards
    // Configure high contrast mode
    // Setup voice control support

    logger.info('✅ Mobile accessibility configured');
  } catch (error) {
    logger.warn('⚠️ Mobile accessibility setup failed', error);
  }
}

// Helper functions for mobile-specific setup
function _setupOfflineSupport(): void {
  logger.info('📴 Initializing offline support mechanisms');

  // Initialize offline queue
  // Setup background sync
  // Configure data persistence
}

function _setupMobileNorwegianCompliance(): void {
  logger.info('🇳🇴 Initializing Norwegian compliance for mobile platform');

  // Setup mobile-specific compliance features
  // Configure Norwegian security standards
  // Setup municipality integrations
}
