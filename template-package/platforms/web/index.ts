/**
 * PACKAGE_DISPLAY_NAME - Web Platform Support
 *
 * Web-specific implementations and browser optimizations
 *
 * @platform web
 * @classification NSM_CLASSIFICATION
 */

import { MainPackage, PackageConfig } from "../../src/index.js";

export interface WebConfig extends PackageConfig {
  /** Browser compatibility mode */
  browserCompat?: "modern" | "legacy";
  /** Service Worker support */
  serviceWorker?: boolean;
  /** Local storage prefix */
  storagePrefix?: string;
}

/**
 * Web-optimized Package implementation
 */
export class WebPackage extends MainPackage {
  private webConfig: WebConfig;

  constructor(config: WebConfig = {}) {
    super(config);
    this.webConfig = {
      browserCompat: "modern",
      serviceWorker: false,
      storagePrefix: "PACKAGE_NAME",
      ...config,
    };
  }

  /**
   * Initialize web-specific features
   */
  override async initialize(config?: WebConfig): Promise<void> {
    await super.initialize(config);

    if (this.webConfig.serviceWorker && "serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
        console.log("[Package] Service Worker registered");
      } catch (error) {
        console.warn("[Package] Service Worker registration failed:", error);
      }
    }
  }

  /**
   * Get browser information for compliance reporting
   */
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };
  }

  /**
   * Store data in localStorage with classification prefix
   */
  setLocalData(key: string, value: any): void {
    try {
      const prefixedKey = `${this.webConfig.storagePrefix}_${key}`;
      const classifiedValue = {
        data: value,
        classification: this.getConfig().classification,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(prefixedKey, JSON.stringify(classifiedValue));
    } catch (error) {
      console.error("[Package] Failed to store local data:", error);
    }
  }

  /**
   * Get data from localStorage
   */
  getLocalData(key: string): any {
    try {
      const prefixedKey = `${this.webConfig.storagePrefix}_${key}`;
      const stored = localStorage.getItem(prefixedKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Validate classification match
      if (parsed.classification !== this.getConfig().classification) {
        console.warn("[Package] Classification mismatch for stored data");
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("[Package] Failed to retrieve local data:", error);
      return null;
    }
  }
}

// Export web-specific implementation as default
export default WebPackage;

// Re-export core functionality
export * from "../../src/index.js";
