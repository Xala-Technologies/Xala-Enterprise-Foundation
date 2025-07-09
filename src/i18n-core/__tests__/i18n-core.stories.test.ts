/**
 * I18n Core User Story Tests
 * Tests real-world scenarios for Norwegian government-compliant internationalization
 */

import {
  I18nManager,
  createI18nManager,
  getI18nManager,
  setLocale,
  getCurrentLocale,
  t,
  tp,
} from '../index';

describe('I18n Core User Stories', () => {
  let i18n: I18nManager;

  beforeEach(() => {
    i18n = createI18nManager({
      defaultLocale: 'nb-NO',
      fallbackLocale: 'en',
      enableInterpolation: true,
      enablePluralRules: true,
    });
  });

  // User Story 1: Bergen Kommune employee needs interface in Norwegian Nynorsk
  it('Bergen Kommune Story: should support Norwegian Nynorsk for local government', async () => {
    // Given: Bergen Kommune uses Nynorsk as official language
    await i18n.loadMessages('nn-NO', {
      booking: {
        create: {
          title: 'Opprett ny reservasjon',
          button: 'Stadfest reservasjon',
        },
        room: {
          select: 'Vel rom',
        },
      },
      common: {
        save: 'Lagre',
        cancel: 'Avbryt',
      },
    });

    // When: Bergen Kommune employee uses the system in Nynorsk
    i18n.setLocale('nn-NO');

    const translations = {
      bookingTitle: i18n.t('booking.create.title'),
      selectRoom: i18n.t('booking.room.select'),
      confirmBooking: i18n.t('booking.create.button'),
      dateFormat: i18n.formatDate(new Date('2025-01-15')),
      currency: i18n.formatCurrency(250, 'NOK'),
    };

    // Then: Interface should be in proper Nynorsk
    expect(translations.bookingTitle).toBe('Opprett ny reservasjon');
    expect(translations.selectRoom).toBe('Vel rom');
    expect(translations.confirmBooking).toBe('Stadfest reservasjon');
    expect(translations.dateFormat).toMatch(/15\.01\.2025/);
    expect(translations.currency).toMatch(/250[,\s]*00\s*kr/);

    // Verify current locale is Nynorsk
    expect(i18n.getCurrentLocale()).toBe('nn-NO');
    expect(i18n.isNorwegianLocale()).toBe(true);
  });

  // User Story 2: International client needs English interface with proper formatting
  it('International Client Story: should provide English interface with international formatting', async () => {
    // Given: International client from UK uses the system
    await i18n.loadMessages('en', {
      booking: {
        create: {
          title: 'Create New Booking',
          button: 'Confirm Booking',
        },
        room: {
          select: 'Select Room',
        },
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
      },
    });

    // When: System is configured for English locale
    i18n.setLocale('en');

    const formatting = {
      title: i18n.t('booking.create.title'),
      currency: i18n.formatCurrency(250, 'NOK'),
      date: i18n.formatDate(new Date('2025-01-15')),
      number: i18n.formatNumber(1234.56),
    };

    // Then: Formatting should follow English conventions
    expect(formatting.title).toBe('Create New Booking');
    expect(formatting.currency).toContain('NOK');
    expect(formatting.date).toMatch(/1\/15\/2025/);
    expect(formatting.number).toContain('1,234.56');

    // Verify locale is not Norwegian
    expect(i18n.getCurrentLocale()).toBe('en');
    expect(i18n.isNorwegianLocale()).toBe(false);
  });

  // User Story 3: Accessibility coordinator needs proper pluralization for screen readers
  it('Accessibility Story: should provide proper pluralization for assistive technology', async () => {
    // Given: Screen reader needs to announce booking counts correctly
    await i18n.loadMessages('nb-NO', {
      booking: {
        count: {
          one: '{{count}} reservasjon',
          other: '{{count}} reservasjoner',
        },
      },
      user: {
        count: {
          one: '{{count}} bruker',
          other: '{{count}} brukere',
        },
      },
    });

    i18n.setLocale('nb-NO');

    // When: Different counts are pluralized
    const announcements = {
      zero: i18n.tp('booking.count', 0),
      one: i18n.tp('booking.count', 1),
      few: i18n.tp('booking.count', 3),
      many: i18n.tp('booking.count', 25),
      userOne: i18n.tp('user.count', 1),
      userMany: i18n.tp('user.count', 15),
    };

    // Then: Pluralization should be grammatically correct for Norwegian
    expect(announcements.zero).toBe('0 reservasjoner'); // Uses 'other' form
    expect(announcements.one).toBe('1 reservasjon');
    expect(announcements.few).toBe('3 reservasjoner');
    expect(announcements.many).toBe('25 reservasjoner');
    expect(announcements.userOne).toBe('1 bruker');
    expect(announcements.userMany).toBe('15 brukere');
  });

  // User Story 4: Content manager needs to handle missing translations gracefully
  it('Content Manager Story: should handle missing translations with fallbacks', async () => {
    // Given: New feature has incomplete translations
    await i18n.loadMessages('nb-NO', {
      booking: {
        existing_feature: 'Eksisterende funksjon',
      },
    });

    await i18n.loadMessages('en', {
      booking: {
        existing_feature: 'Existing Feature',
        new_feature: 'New Feature',
      },
    });

    // When: Norwegian locale is set but translation is missing
    i18n.setLocale('nb-NO');

    const translations = {
      existing: i18n.t('booking.existing_feature'),
      missing: i18n.t('booking.new_feature'), // Missing in Norwegian
      completelyMissing: i18n.t('booking.nonexistent_key'),
    };

    // Then: Should gracefully fall back and handle missing translations
    expect(translations.existing).toBe('Eksisterende funksjon');
    expect(translations.missing).toBe('New Feature'); // Falls back to English
    expect(translations.completelyMissing).toBe('booking.nonexistent_key'); // Returns key
  });

  // User Story 5: Municipality admin needs Norwegian-specific formatting
  it('Municipality Admin Story: should provide Norwegian-specific formatting', async () => {
    // Given: Norwegian municipality needs proper Norwegian formatting
    i18n.setLocale('nb-NO');

    // When: Norwegian data is formatted
    const formatting = {
      personnummer: i18n.formatNorwegianPersonNumber('12345678901'),
      orgnummer: i18n.formatNorwegianOrganizationNumber('123456789'),
      currency: i18n.formatCurrency(12500.5, 'NOK'),
      date: i18n.formatDate(new Date('2025-01-15')),
      number: i18n.formatNumber(1234.56),
    };

    // Then: Should use proper Norwegian formatting
    expect(formatting.personnummer).toBe('123456 78901');
    expect(formatting.orgnummer).toBe('123 456 789');
    expect(formatting.currency).toMatch(/12\s*500[,\s]*50\s*kr/);
    expect(formatting.date).toMatch(/15\.01\.2025/);
    expect(formatting.number).toContain('1');
  });

  // Additional integration tests
  it('should support interpolation with Norwegian parameters', async () => {
    // Given: Translation with interpolation parameters
    await i18n.loadMessages('nb-NO', {
      booking: {
        confirmation: 'Booking {{bookingId}} er bekreftet for {{userName}} den {{date}}',
      },
    });

    i18n.setLocale('nb-NO');

    // When: Translation with parameters is requested
    const message = i18n.t('booking.confirmation', {
      bookingId: 'BK-2025-001',
      userName: 'Ola Nordmann',
      date: '15. januar 2025',
    });

    // Then: Parameters should be properly interpolated
    expect(message).toBe('Booking BK-2025-001 er bekreftet for Ola Nordmann den 15. januar 2025');
  });

  it('should provide comprehensive locale statistics and information', () => {
    // Given: i18n system with multiple locales configured
    // When: Statistics are requested
    const stats = i18n.getStats();

    // Then: Should provide useful locale information
    expect(stats.currentLocale).toBe('nb-NO');
    expect(stats.fallbackLocale).toBe('en');
    expect(stats.totalLocales).toBeGreaterThan(0);
    expect(stats.norwegianLocales).toBeGreaterThan(0);
    expect(stats.isNorwegian).toBe(true);

    // Check available locales
    const availableLocales = i18n.getAvailableLocales();
    expect(availableLocales.length).toBeGreaterThan(0);

    const norwegianLocales = i18n.getNorwegianLocales();
    expect(norwegianLocales.length).toBe(2); // nb-NO and nn-NO
    expect(norwegianLocales.every(locale => locale.norwegianCompliant)).toBe(true);
  });

  it('should handle locale switching with proper validation', () => {
    // Given: Multiple locales are available
    // When: Valid and invalid locales are set
    i18n.setLocale('nn-NO'); // Valid Norwegian Nynorsk
    expect(i18n.getCurrentLocale()).toBe('nn-NO');

    i18n.setLocale('en'); // Valid English
    expect(i18n.getCurrentLocale()).toBe('en');

    // When: Invalid locale is set
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    i18n.setLocale('invalid-locale');

    // Then: Should fall back to fallback locale and warn
    expect(i18n.getCurrentLocale()).toBe('en'); // Falls back to fallback locale
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Locale invalid-locale not registered')
    );

    consoleSpy.mockRestore();
  });

  it('should support convenience functions for global i18n operations', async () => {
    // Given: Global i18n functions are available
    const globalManager = getI18nManager();

    await globalManager.loadMessages('nb-NO', {
      test: {
        message: 'Test melding',
        count: {
          one: '{{count}} element',
          other: '{{count}} elementer',
        },
      },
    });

    // When: Global convenience functions are used
    setLocale('nb-NO');

    const currentLocale = getCurrentLocale();
    const translation = t('test.message');
    const pluralTranslation = tp('test.count', 5);

    // Then: Global functions should work correctly
    expect(currentLocale).toBe('nb-NO');
    expect(translation).toBe('Test melding');
    expect(pluralTranslation).toBe('5 elementer');
  });

  it('should handle complex nested message structures', async () => {
    // Given: Complex nested message structure
    await i18n.loadMessages('nb-NO', {
      forms: {
        booking: {
          fields: {
            name: {
              label: 'Navn',
              placeholder: 'Skriv inn navnet ditt',
              validation: {
                required: 'Navn er påkrevd',
                minLength: 'Navn må være minst {{min}} tegn',
              },
            },
            email: {
              label: 'E-post',
              validation: {
                required: 'E-post er påkrevd',
                invalid: 'Ugyldig e-postadresse',
              },
            },
          },
        },
      },
    });

    i18n.setLocale('nb-NO');

    // When: Nested translations are accessed
    const translations = {
      nameLabel: i18n.t('forms.booking.fields.name.label'),
      namePlaceholder: i18n.t('forms.booking.fields.name.placeholder'),
      nameRequired: i18n.t('forms.booking.fields.name.validation.required'),
      nameMinLength: i18n.t('forms.booking.fields.name.validation.minLength', { min: 2 }),
      emailInvalid: i18n.t('forms.booking.fields.email.validation.invalid'),
    };

    // Then: All nested translations should be properly resolved
    expect(translations.nameLabel).toBe('Navn');
    expect(translations.namePlaceholder).toBe('Skriv inn navnet ditt');
    expect(translations.nameRequired).toBe('Navn er påkrevd');
    expect(translations.nameMinLength).toBe('Navn må være minst 2 tegn');
    expect(translations.emailInvalid).toBe('Ugyldig e-postadresse');
  });
});
