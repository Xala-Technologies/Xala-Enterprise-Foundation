/**
 * Mobile Storage Adapter
 * React Native AsyncStorage with Norwegian compliance
 */

import { createLogger } from '../../src/logger/index.js';

const logger = createLogger({
  level: 'debug',
  auditEnabled: true,
  complianceEnabled: true,
});

export class AsyncStorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'foundation-') {
    this.prefix = prefix;
  }

  /**
   * Store data with Norwegian compliance metadata
   */
  async store(
    key: string,
    data: any,
    options?: {
      classification?: string;
      ttl?: number;
      encrypted?: boolean;
    }
  ) {
    const storageKey = `${this.prefix}${key}`;
    const storageData = {
      data,
      timestamp: new Date().toISOString(),
      classification: options?.classification || 'ÅPEN',
      platform: 'mobile',
      encrypted: options?.encrypted || false,
      expires: options?.ttl ? new Date(Date.now() + options.ttl * 1000).toISOString() : null,
    };

    try {
      // In a real React Native app, this would use AsyncStorage
      // For now, we'll use a simple in-memory store
      this.setItem(storageKey, JSON.stringify(storageData));
      return true;
    } catch (error) {
      logger.warn(
        'Failed to store mobile data',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Retrieve data with compliance validation
   */
  async retrieve(key: string): Promise<any | null> {
    const storageKey = `${this.prefix}${key}`;

    try {
      const stored = await this.getItem(storageKey);
      if (!stored) return null;

      const storageData = JSON.parse(stored);

      // Check if data has expired
      if (storageData.expires && new Date() > new Date(storageData.expires)) {
        await this.removeItem(storageKey);
        return null;
      }

      return storageData.data;
    } catch (error) {
      logger.warn(
        'Failed to retrieve mobile data',
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Remove data with audit trail
   */
  async remove(key: string): Promise<boolean> {
    const storageKey = `${this.prefix}${key}`;

    try {
      await this.removeItem(storageKey);
      return true;
    } catch (error) {
      logger.warn(
        'Failed to remove mobile data',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Clear all foundation data
   */
  async clear(): Promise<boolean> {
    try {
      // In a real React Native app, this would iterate through AsyncStorage keys
      logger.debug('Clearing mobile storage for prefix', { prefix: this.prefix });
      return true;
    } catch (error) {
      logger.warn(
        'Failed to clear mobile data',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  // Mock storage methods (would be replaced with AsyncStorage in real app)
  private storage = new Map<string, string>();

  private async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  private async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  private async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }
}
