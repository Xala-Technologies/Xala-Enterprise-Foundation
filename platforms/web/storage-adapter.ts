/**
 * Web Storage Adapter
 * Browser storage with Norwegian compliance support
 */

export class WebStorageAdapter {
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
      storage?: 'localStorage' | 'sessionStorage';
    }
  ) {
    const storageKey = `${this.prefix}${key}`;
    const storageData = {
      data,
      timestamp: new Date().toISOString(),
      classification: options?.classification || 'ÅPEN',
      platform: 'web',
      expires: options?.ttl ? new Date(Date.now() + options.ttl * 1000).toISOString() : null,
    };

    try {
      const storage = options?.storage === 'sessionStorage' ? sessionStorage : localStorage;
      storage.setItem(storageKey, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.warn('Failed to store data:', error);
      return false;
    }
  }

  /**
   * Retrieve data with compliance validation
   */
  async retrieve(
    key: string,
    options?: { storage?: 'localStorage' | 'sessionStorage' }
  ): Promise<any | null> {
    const storageKey = `${this.prefix}${key}`;

    try {
      const storage = options?.storage === 'sessionStorage' ? sessionStorage : localStorage;
      const stored = storage.getItem(storageKey);
      if (!stored) return null;

      const storageData = JSON.parse(stored);

      // Check if data has expired
      if (storageData.expires && new Date() > new Date(storageData.expires)) {
        storage.removeItem(storageKey);
        return null;
      }

      return storageData.data;
    } catch (error) {
      console.warn('Failed to retrieve data:', error);
      return null;
    }
  }

  /**
   * Remove data with audit trail
   */
  async remove(
    key: string,
    options?: { storage?: 'localStorage' | 'sessionStorage' }
  ): Promise<boolean> {
    const storageKey = `${this.prefix}${key}`;

    try {
      const storage = options?.storage === 'sessionStorage' ? sessionStorage : localStorage;
      storage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.warn('Failed to remove data:', error);
      return false;
    }
  }

  /**
   * Clear all foundation data
   */
  async clear(): Promise<boolean> {
    try {
      // Clear from both storages
      [localStorage, sessionStorage].forEach(storage => {
        const keysToRemove = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => storage.removeItem(key));
      });

      return true;
    } catch (error) {
      console.warn('Failed to clear data:', error);
      return false;
    }
  }
}
