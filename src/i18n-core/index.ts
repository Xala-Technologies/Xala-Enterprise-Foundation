/**
 * i18n Core Module
 * Internationalization support with Norwegian language and compliance features
 */

export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

export interface LocaleConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  norwegianCompliant?: boolean;
}

export interface I18nOptions {
  defaultLocale?: string;
  fallbackLocale?: string;
  enableInterpolation?: boolean;
  enablePluralRules?: boolean;
  loadMessages?: (locale: string) => Promise<TranslationMessages>;
}

export class I18nManager {
  private currentLocale: string;
  private fallbackLocale: string;
  private messages: Map<string, TranslationMessages> = new Map();
  private locales: Map<string, LocaleConfig> = new Map();
  private options: I18nOptions;

  constructor(options: I18nOptions = {}) {
    this.options = {
      defaultLocale: 'nb-NO',
      fallbackLocale: 'en',
      enableInterpolation: true,
      enablePluralRules: true,
      ...options,
    };

    this.currentLocale = this.options.defaultLocale!;
    this.fallbackLocale = this.options.fallbackLocale!;

    // Initialize Norwegian locales
    this.initializeNorwegianLocales();
  }

  // Initialize Norwegian language support
  private initializeNorwegianLocales(): void {
    // Norwegian Bokmål
    this.registerLocale({
      code: 'nb-NO',
      name: 'Norsk (Bokmål)',
      direction: 'ltr',
      dateFormat: 'dd.MM.yyyy',
      numberFormat: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
      norwegianCompliant: true,
    });

    // Norwegian Nynorsk
    this.registerLocale({
      code: 'nn-NO',
      name: 'Norsk (Nynorsk)',
      direction: 'ltr',
      dateFormat: 'dd.MM.yyyy',
      numberFormat: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
      norwegianCompliant: true,
    });

    // English fallback
    this.registerLocale({
      code: 'en',
      name: 'English',
      direction: 'ltr',
      dateFormat: 'MM/dd/yyyy',
      numberFormat: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    });
  }

  // Register locale configuration
  registerLocale(config: LocaleConfig): void {
    this.locales.set(config.code, config);
  }

  // Set current locale
  setLocale(locale: string): void {
    if (!this.locales.has(locale)) {
      console.warn(`Locale ${locale} not registered, falling back to ${this.fallbackLocale}`);
      locale = this.fallbackLocale;
    }
    this.currentLocale = locale;
  }

  // Get current locale
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  // Load messages for a locale
  async loadMessages(locale: string, messages: TranslationMessages): Promise<void> {
    this.messages.set(locale, messages);
  }

  // Get translated message
  t(key: string, params?: Record<string, any>, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const messages = this.messages.get(targetLocale);

    let translation = this.getNestedValue(messages, key);

    // Fallback to default locale if not found
    if (!translation && targetLocale !== this.fallbackLocale) {
      const fallbackMessages = this.messages.get(this.fallbackLocale);
      translation = this.getNestedValue(fallbackMessages, key);
    }

    // Return key if no translation found
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Apply interpolation if enabled
    if (this.options.enableInterpolation && params) {
      translation = this.interpolate(translation, params);
    }

    return translation;
  }

  // Pluralization support
  tp(key: string, count: number, params?: Record<string, any>, locale?: string): string {
    if (!this.options.enablePluralRules) {
      return this.t(key, { ...params, count }, locale);
    }

    const targetLocale = locale || this.currentLocale;
    const pluralRule = this.getPluralRule(count, targetLocale);
    const pluralKey = `${key}.${pluralRule}`;

    return this.t(pluralKey, { ...params, count }, locale);
  }

  // Format date according to locale
  formatDate(date: Date, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const localeConfig = this.locales.get(targetLocale);

    if (!localeConfig) {
      return date.toLocaleDateString();
    }

    return new Intl.DateTimeFormat(targetLocale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  // Format number according to locale
  formatNumber(number: number, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const localeConfig = this.locales.get(targetLocale);

    const formatOptions = localeConfig?.numberFormat || {};
    return new Intl.NumberFormat(targetLocale, formatOptions).format(number);
  }

  // Format currency (Norwegian Kroner support)
  formatCurrency(amount: number, currency: string = 'NOK', locale?: string): string {
    const targetLocale = locale || this.currentLocale;

    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Norwegian-specific formatting
  formatNorwegianPersonNumber(personnummer: string): string {
    if (personnummer.length !== 11) {
      return personnummer;
    }

    return `${personnummer.slice(0, 6)} ${personnummer.slice(6)}`;
  }

  formatNorwegianOrganizationNumber(orgnr: string): string {
    if (orgnr.length !== 9) {
      return orgnr;
    }

    return `${orgnr.slice(0, 3)} ${orgnr.slice(3, 6)} ${orgnr.slice(6)}`;
  }

  // Get nested value from messages object
  private getNestedValue(obj: TranslationMessages | undefined, key: string): string | undefined {
    if (!obj) return undefined;

    const keys = key.split('.');
    let current: any = obj;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  // Interpolate parameters into translation
  private interpolate(template: string, params: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Get plural rule for locale
  private getPluralRule(count: number, locale: string): string {
    // Simplified Norwegian plural rules
    if (locale.startsWith('nb-') || locale.startsWith('nn-')) {
      return count === 1 ? 'one' : 'other';
    }

    // English plural rules
    if (locale.startsWith('en')) {
      return count === 1 ? 'one' : 'other';
    }

    return 'other';
  }

  // Get available locales
  getAvailableLocales(): LocaleConfig[] {
    return Array.from(this.locales.values());
  }

  // Get Norwegian-compliant locales
  getNorwegianLocales(): LocaleConfig[] {
    return Array.from(this.locales.values()).filter(locale => locale.norwegianCompliant);
  }

  // Check if current locale is Norwegian
  isNorwegianLocale(locale?: string): boolean {
    const targetLocale = locale || this.currentLocale;
    const localeConfig = this.locales.get(targetLocale);
    return localeConfig?.norwegianCompliant || false;
  }

  // Get locale statistics
  getStats() {
    return {
      currentLocale: this.currentLocale,
      fallbackLocale: this.fallbackLocale,
      totalLocales: this.locales.size,
      loadedMessages: this.messages.size,
      norwegianLocales: this.getNorwegianLocales().length,
      isNorwegian: this.isNorwegianLocale(),
    };
  }
}

// Default i18n manager
let defaultManager: I18nManager;

export const getI18nManager = (): I18nManager => {
  if (!defaultManager) {
    defaultManager = new I18nManager();
  }
  return defaultManager;
};

export const createI18nManager = (options?: I18nOptions): I18nManager => {
  return new I18nManager(options);
};

// Convenience functions
export const t = (key: string, params?: Record<string, any>, locale?: string): string => {
  return getI18nManager().t(key, params, locale);
};

export const tp = (
  key: string,
  count: number,
  params?: Record<string, any>,
  locale?: string
): string => {
  return getI18nManager().tp(key, count, params, locale);
};

export const setLocale = (locale: string): void => {
  getI18nManager().setLocale(locale);
};

export const getCurrentLocale = (): string => {
  return getI18nManager().getCurrentLocale();
};
