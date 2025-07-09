# UI System Package Implementation Checklist

## 📋 Package Overview

**Role**: Multi-Platform UI Component Library  
**Dependencies**: ONLY @xala-technologies/foundation  
**Story Points**: 12 points  
**Status**: 📋 PLANNED

### Core Responsibilities

- Cross-platform UI components (React, React Native, Web Components)
- Norwegian government design standards compliance
- Multi-tenant theming and branding system
- Accessibility compliance (WCAG 2.2 AA + Universal Design)
- Event-driven UI state management
- Norwegian cultural UI adaptations
- Government service UI patterns and workflows
- Multi-language UI component support

## 🏗️ Event-Based Architecture

### UI State Events

```typescript
import { EventBus } from '@xala-technologies/foundation';

// UI state changes through events (no direct state management)
EventBus.publish('ui.state.changed', {
  componentId: 'citizen-form',
  stateType: 'form_validation',
  previousState: { isValid: false, errors: ['personnummer'] },
  newState: { isValid: true, errors: [] },
  classification: 'ÅPEN',
  userAction: 'field_updated',
  accessibility: {
    announcementText: 'Personnummer er nå gyldig',
    screenReaderUpdate: true,
  },
});

// UI responds to business events (no direct API calls)
EventBus.subscribe('business.citizen.updated', async event => {
  // Update UI components with fresh data
  EventBus.publish('ui.data.refresh', {
    componentIds: ['citizen-profile', 'citizen-form'],
    data: event.citizenData,
    source: 'business_event',
    classification: event.classification,
    updateType: 'data_sync',
  });

  // Show Norwegian-compliant success message
  EventBus.publish('ui.notification.show', {
    type: 'success',
    messageKey: 'citizen.updated.success',
    locale: event.locale || 'nb',
    classification: 'ÅPEN',
    accessibility: {
      role: 'status',
      importance: 'polite',
    },
  });
});

// Theme changes for multi-tenant branding
EventBus.subscribe('tenant.theme.changed', async event => {
  EventBus.publish('ui.theme.apply', {
    tenantId: event.tenantId,
    themeConfig: event.themeConfig,
    brandingAssets: event.brandingAssets,
    accessibilitySettings: event.accessibilitySettings,
    norwegianCompliance: {
      colorContrast: 'WCAG_AA',
      universalDesign: true,
      governmentBranding: event.isGovernmentTenant,
    },
  });
});

// Norwegian government authentication UI flows
EventBus.subscribe('norwegian.auth.flow.started', async event => {
  EventBus.publish('ui.auth.modal.show', {
    authProvider: event.provider, // 'ID_PORTEN' | 'BANKID' | 'ALTINN'
    flowType: event.flowType, // 'citizen' | 'business' | 'employee'
    securityLevel: event.securityLevel,
    locale: event.locale,
    accessibility: {
      focusTarget: 'auth-modal',
      announceText: 'Autentisering startet',
    },
  });
});
```

### Component Communication Events

```typescript
import { ServiceRegistry } from '@xala-technologies/foundation';

// Register UI component capabilities
ServiceRegistry.register('ui-components', {
  name: 'UISystemComponents',
  version: '2.0.0',
  platforms: ['web', 'mobile', 'desktop'],
  componentTypes: [
    'forms',
    'navigation',
    'data-display',
    'feedback',
    'overlays',
    'norwegian-specific',
  ],
  compliance: {
    accessibility: 'WCAG_2_2_AA',
    universalDesign: true,
    norwegianStandards: 'GOVERNMENT_APPROVED',
    multiLanguage: ['nb', 'nn', 'en', 'se'],
  },
  features: [
    'multi-tenant-theming',
    'norwegian-formatting',
    'government-workflows',
    'accessibility-first',
    'event-driven-updates',
  ],
});

// Cross-component communication via events
EventBus.subscribe('ui.form.validated', async event => {
  if (event.componentType === 'NorwegianCitizenForm') {
    // Trigger related component updates
    EventBus.publish('ui.component.update', {
      targetComponents: ['citizen-preview', 'submission-summary'],
      updateType: 'validation_state',
      validationResult: event.validationResult,
      norwegianFields: {
        personnummer: event.validationResult.personnummer,
        address: event.validationResult.address,
        kommune: event.validationResult.kommune,
      },
    });
  }
});

// Norwegian accessibility compliance events
EventBus.subscribe('ui.accessibility.violation.detected', async event => {
  await accessibilityLogger.logViolation({
    componentId: event.componentId,
    violationType: event.violationType,
    wcagCriterion: event.wcagCriterion,
    norwegianStandard: event.norwegianStandard,
    severity: event.severity,
    remediation: event.suggestedRemediation,
  });

  // Auto-fix common accessibility issues
  if (event.autoFixable) {
    EventBus.publish('ui.accessibility.auto.fix', {
      componentId: event.componentId,
      fixType: event.fixType,
      beforeState: event.beforeState,
      afterState: event.expectedAfterState,
    });
  }
});
```

## ✅ Implementation Tasks

### Phase 1: Foundation Integration & Component Architecture (3 points)

- [ ] **Update package dependencies** (1 point)
  - Remove all dependencies except foundation and UI framework essentials
  - Update imports to use foundation localization and types
  - Configure Norwegian design token integration
  - Set up accessibility validation pipeline

- [ ] **Implement base component architecture** (2 points)
  - Create BaseComponent extending foundation ServiceLifecycle
  - Implement Norwegian accessibility standards (Universal Design)
  - Add multi-tenant theming support
  - Create event-driven component communication
  - File: `src/modules/base/base.component.ts`

### Phase 2: Norwegian Government UI Components (4 points)

- [ ] **Norwegian identity components** (2 points)
  - PersonnummerInput with validation and formatting
  - NorwegianAddressForm with postal code validation
  - OrganizationNumberInput with Brønnøysund validation
  - KommuneSelector with official municipality data
  - File: `src/modules/norwegian/identity/`

- [ ] **Government service UI patterns** (2 points)
  - CitizenServiceForm with government workflow patterns
  - MunicipalApplicationForm with standardized layouts
  - GovernmentDocumentViewer with accessibility compliance
  - ComplianceStatusIndicator for GDPR/NSM status
  - File: `src/modules/norwegian/government/`

### Phase 3: Accessibility & Universal Design (3 points)

- [ ] **WCAG 2.2 AA compliance implementation** (2 points)
  - Screen reader optimization for all components
  - Keyboard navigation and focus management
  - Color contrast validation and adjustment
  - Alternative text and ARIA labels
  - File: `src/modules/accessibility/`

- [ ] **Norwegian Universal Design implementation** (1 point)
  - High contrast mode support
  - Font size scaling (125%, 150%, 200%)
  - Motor impairment accommodations
  - Cognitive accessibility features
  - File: `src/modules/accessibility/universal-design/`

### Phase 4: Multi-Platform Support & Performance (2 points)

- [ ] **Cross-platform component library** (1 point)
  - React web component implementations
  - React Native mobile implementations
  - Web Components for framework independence
  - Shared design tokens across platforms
  - File: `src/modules/platforms/`

- [ ] **Performance optimization** (1 point)
  - Component lazy loading and code splitting
  - Norwegian font optimization
  - Image optimization for Norwegian graphics
  - Bundle size optimization per platform
  - File: `src/modules/performance/`

## 🇳🇴 Norwegian UI Compliance Requirements

### Universal Design (Universell Utforming)

- [ ] **Norwegian Accessibility Standards** (MANDATORY)

  ```typescript
  interface UniversalDesignCompliance {
    wcagLevel: 'AA' | 'AAA';
    norwegianStandards: {
      universellUtforming: boolean;
      kontrastKrav: number; // 4.5:1 minimum
      tekstskalering: number[]; // [125, 150, 200]%
      tastaturnavigasjon: boolean;
      skjermleserStøtte: boolean;
    };
    cognitiveAccessibility: {
      enkeltSpråk: boolean; // Simple Norwegian language
      konsekventNavigasjon: boolean;
      tydeligeFeilmeldinger: boolean;
      hjelpetekster: boolean;
    };
    motorImpairment: {
      storeTrykkmål: boolean; // Large touch targets
      dragOgSlippAlternativer: boolean;
      tidsbegrensningerFleksible: boolean;
    };
  }

  // Every component must pass Universal Design validation
  function validateUniversalDesign(component: UIComponent): ValidationResult {
    return {
      wcagCompliant: checkWCAGCompliance(component),
      universalDesignCompliant: checkNorwegianAccessibility(component),
      recommendations: generateAccessibilityRecommendations(component),
      autoFixable: identifyAutoFixableIssues(component),
    };
  }
  ```

### Norwegian Government Design Standards

- [ ] **Design System Compliance** (MANDATORY)
  ```typescript
  interface NorwegianGovernmentDesign {
    designTokens: {
      colors: {
        primary: '#0055B8'; // Norwegian government blue
        secondary: '#FF6B35'; // Norwegian alert orange
        success: '#158141'; // Norwegian success green
        warning: '#F59E0B'; // Norwegian warning amber
        error: '#DC2626'; // Norwegian error red
        neutral: NorwegianNeutralPalette;
      };
      typography: {
        primaryFont: 'Source Sans Pro'; // Norwegian government font
        headingScale: NorwegianTypographyScale;
        bodyText: NorwegianTextSizing;
        readability: NorwegianReadabilityStandards;
      };
      spacing: NorwegianSpacingSystem;
      borderRadius: NorwegianBorderSystem;
      elevation: NorwegianShadowSystem;
    };
    branding: {
      governmentLogo: string; // Official government branding
      municipalityBranding: MunicipalityBrandingConfig;
      complianceBadges: ComplianceBadgeConfig;
    };
    layouts: {
      governmentFormLayout: FormLayoutStandards;
      citizenPortalLayout: PortalLayoutStandards;
      mobileAccessibility: MobileLayoutStandards;
    };
  }
  ```

### Multi-Language UI Requirements

- [ ] **Norwegian Language Support** (MANDATORY)

  ```typescript
  interface NorwegianLanguageSupport {
    languages: {
      bokmål: 'nb'; // Primary Norwegian
      nynorsk: 'nn'; // Secondary Norwegian
      english: 'en'; // International
      sami: 'se'; // Indigenous language support
    };
    textDirection: 'ltr'; // Left-to-right for Norwegian
    dateFormats: {
      short: 'dd.MM.yyyy'; // Norwegian date format
      long: 'dddd, d. MMMM yyyy'; // Norwegian long format
    };
    numberFormats: {
      decimal: ','; // Norwegian decimal separator
      thousands: ' '; // Norwegian thousands separator
      currency: 'NOK'; // Norwegian currency
    };
    addressFormats: NorwegianAddressFormats;
    phoneFormats: NorwegianPhoneFormats;
    businessFormats: NorwegianBusinessFormats;
  }

  // All text must be translatable and culturally appropriate
  function getNorwegianText(
    key: string,
    locale: NorwegianLocale,
    context?: NorwegianContext
  ): string {
    return norwegianTranslationService.getText(key, locale, context);
  }
  ```

## 🧪 Testing Requirements

### Accessibility Testing (MANDATORY - 100% coverage)

- [ ] **Automated Accessibility Tests**
  - axe-core integration for WCAG validation
  - Norwegian accessibility standard validation
  - Screen reader compatibility testing
  - Keyboard navigation testing
  - Color contrast validation

- [ ] **Manual Accessibility Tests**
  - Screen reader user testing
  - Keyboard-only navigation testing
  - High contrast mode testing
  - Font scaling testing (125%, 150%, 200%)
  - Motor impairment simulation testing

### Multi-Platform Testing

- [ ] **Cross-Platform Component Tests**
  - React web component functionality
  - React Native mobile component functionality
  - Web Components browser compatibility
  - Norwegian content rendering across platforms

- [ ] **Visual Regression Tests**
  - Norwegian typography rendering
  - Government design system compliance
  - Multi-tenant theming accuracy
  - Accessibility feature visual validation

### Norwegian Content Testing

- [ ] **Language and Cultural Tests**
  - Norwegian text rendering (Bokmål/Nynorsk)
  - Date and number formatting
  - Address and phone number formatting
  - Government form field validation
  - Municipal service UI workflows

## 📁 File Structure

```
packages-v2/ui-system/
├── package.json (foundation + React + React Native)
├── src/
│   ├── index.ts
│   └── modules/
│       ├── index.ts
│       ├── base/
│       │   ├── index.ts
│       │   ├── interfaces/
│       │   │   ├── base-component.interface.ts
│       │   │   └── accessibility.interface.ts
│       │   ├── components/
│       │   │   ├── base.component.ts
│       │   │   └── accessible.component.ts
│       │   ├── hooks/
│       │   │   ├── useAccessibility.ts
│       │   │   ├── useNorwegianLocale.ts
│       │   │   └── useEventDrivenState.ts
│       │   └── types/
│       │       ├── base.types.ts
│       │       └── accessibility.types.ts
│       ├── norwegian/
│       │   ├── index.ts
│       │   ├── identity/
│       │   │   ├── PersonnummerInput/
│       │   │   │   ├── PersonnummerInput.tsx
│       │   │   │   ├── PersonnummerInput.native.tsx
│       │   │   │   ├── PersonnummerInput.test.tsx
│       │   │   │   └── PersonnummerInput.stories.tsx
│       │   │   ├── NorwegianAddressForm/
│       │   │   │   ├── NorwegianAddressForm.tsx
│       │   │   │   ├── NorwegianAddressForm.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── OrganizationNumberInput/
│       │   │   │   ├── OrganizationNumberInput.tsx
│       │   │   │   ├── OrganizationNumberInput.native.tsx
│       │   │   │   └── index.ts
│       │   │   └── KommuneSelector/
│       │   │       ├── KommuneSelector.tsx
│       │   │       ├── KommuneSelector.native.tsx
│       │   │       └── index.ts
│       │   ├── government/
│       │   │   ├── CitizenServiceForm/
│       │   │   │   ├── CitizenServiceForm.tsx
│       │   │   │   ├── CitizenServiceForm.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── MunicipalApplicationForm/
│       │   │   │   ├── MunicipalApplicationForm.tsx
│       │   │   │   ├── MunicipalApplicationForm.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── GovernmentDocumentViewer/
│       │   │   │   ├── GovernmentDocumentViewer.tsx
│       │   │   │   ├── GovernmentDocumentViewer.native.tsx
│       │   │   │   └── index.ts
│       │   │   └── ComplianceStatusIndicator/
│       │   │       ├── ComplianceStatusIndicator.tsx
│       │   │       ├── ComplianceStatusIndicator.native.tsx
│       │   │       └── index.ts
│       │   ├── formatting/
│       │   │   ├── norwegian-date.formatter.ts
│       │   │   ├── norwegian-number.formatter.ts
│       │   │   ├── norwegian-address.formatter.ts
│       │   │   └── norwegian-phone.formatter.ts
│       │   └── types/
│       │       ├── norwegian.types.ts
│       │       ├── government.types.ts
│       │       └── identity.types.ts
│       ├── accessibility/
│       │   ├── index.ts
│       │   ├── wcag/
│       │   │   ├── contrast.validator.ts
│       │   │   ├── keyboard.navigator.ts
│       │   │   ├── screen-reader.enhancer.ts
│       │   │   └── focus.manager.ts
│       │   ├── universal-design/
│       │   │   ├── font-scaling.service.ts
│       │   │   ├── high-contrast.service.ts
│       │   │   ├── motor-accessibility.service.ts
│       │   │   └── cognitive-accessibility.service.ts
│       │   ├── validators/
│       │   │   ├── accessibility.validator.ts
│       │   │   ├── norwegian-accessibility.validator.ts
│       │   │   └── universal-design.validator.ts
│       │   └── types/
│       │       ├── accessibility.types.ts
│       │       └── universal-design.types.ts
│       ├── forms/
│       │   ├── index.ts
│       │   ├── components/
│       │   │   ├── Form/
│       │   │   │   ├── Form.tsx
│       │   │   │   ├── Form.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── Input/
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Input.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── Select/
│       │   │   │   ├── Select.tsx
│       │   │   │   ├── Select.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── Checkbox/
│       │   │   │   ├── Checkbox.tsx
│       │   │   │   ├── Checkbox.native.tsx
│       │   │   │   └── index.ts
│       │   │   └── Button/
│       │   │       ├── Button.tsx
│       │   │       ├── Button.native.tsx
│       │   │       └── index.ts
│       │   ├── validation/
│       │   │   ├── form.validator.ts
│       │   │   ├── norwegian.validator.ts
│       │   │   └── accessibility.validator.ts
│       │   └── types/
│       │       ├── form.types.ts
│       │       └── validation.types.ts
│       ├── navigation/
│       │   ├── index.ts
│       │   ├── components/
│       │   │   ├── Navigation/
│       │   │   │   ├── Navigation.tsx
│       │   │   │   ├── Navigation.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── Breadcrumb/
│       │   │   │   ├── Breadcrumb.tsx
│       │   │   │   ├── Breadcrumb.native.tsx
│       │   │   │   └── index.ts
│       │   │   └── TabNavigation/
│       │   │       ├── TabNavigation.tsx
│       │   │       ├── TabNavigation.native.tsx
│       │   │       └── index.ts
│       │   └── types/
│       │       └── navigation.types.ts
│       ├── feedback/
│       │   ├── index.ts
│       │   ├── components/
│       │   │   ├── Alert/
│       │   │   │   ├── Alert.tsx
│       │   │   │   ├── Alert.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── Toast/
│       │   │   │   ├── Toast.tsx
│       │   │   │   ├── Toast.native.tsx
│       │   │   │   └── index.ts
│       │   │   ├── LoadingSpinner/
│       │   │   │   ├── LoadingSpinner.tsx
│       │   │   │   ├── LoadingSpinner.native.tsx
│       │   │   │   └── index.ts
│       │   │   └── ProgressIndicator/
│       │   │       ├── ProgressIndicator.tsx
│       │   │       ├── ProgressIndicator.native.tsx
│       │   │       └── index.ts
│       │   └── types/
│       │       └── feedback.types.ts
│       ├── theming/
│       │   ├── index.ts
│       │   ├── services/
│       │   │   ├── theme.service.ts
│       │   │   ├── norwegian-theme.service.ts
│       │   │   └── multi-tenant-theme.service.ts
│       │   ├── providers/
│       │   │   ├── ThemeProvider.tsx
│       │   │   └── ThemeProvider.native.tsx
│       │   ├── tokens/
│       │   │   ├── norwegian-design-tokens.ts
│       │   │   ├── government-design-tokens.ts
│       │   │   └── accessibility-tokens.ts
│       │   └── types/
│       │       ├── theme.types.ts
│       │       └── design-tokens.types.ts
│       ├── platforms/
│       │   ├── index.ts
│       │   ├── web/
│       │   │   ├── web-components.ts
│       │   │   └── react-web.adapter.ts
│       │   ├── mobile/
│       │   │   ├── react-native.adapter.ts
│       │   │   └── mobile-specific.components.ts
│       │   └── types/
│       │       └── platform.types.ts
│       ├── performance/
│       │   ├── index.ts
│       │   ├── lazy-loading.service.ts
│       │   ├── bundle-optimization.service.ts
│       │   └── norwegian-asset-optimization.service.ts
│       └── events/
│           ├── index.ts
│           ├── ui.events.ts
│           ├── accessibility.events.ts
│           ├── theme.events.ts
│           └── norwegian.events.ts
├── tests/
├── docs/
├── storybook/
└── accessibility-tests/
```

## 🚀 Usage Examples

### Norwegian Identity Form Component

```typescript
import {
  PersonnummerInput,
  NorwegianAddressForm,
  KommuneSelector
} from '@xala-technologies/ui-system';
import { EventBus } from '@xala-technologies/foundation';

// Norwegian citizen registration form
function CitizenRegistrationForm() {
  return (
    <Form
      accessibility={{
        labelledBy: 'citizen-form-title',
        describedBy: 'citizen-form-description',
        required: true
      }}
      norwegianCompliance={{
        dataClassification: 'BEGRENSET',
        gdprApplicable: true,
        nsmCompliant: true
      }}
      onSubmit={(formData) => {
        // Event-driven form submission
        EventBus.publish('ui.form.citizen.submitted', {
          formData: formData,
          formType: 'citizen_registration',
          classification: 'BEGRENSET',
          validation: {
            personnummer: formData.personnummer,
            address: formData.address,
            kommune: formData.kommune
          }
        });
      }}
    >
      <PersonnummerInput
        label="Personnummer"
        required={true}
        helperText="11-sifret personnummer (DDMMYYXXXXX)"
        accessibility={{
          describedBy: 'personnummer-help',
          autoComplete: 'off',
          inputMode: 'numeric'
        }}
        validation={{
          required: true,
          format: 'norwegian_personnummer',
          realTimeValidation: true
        }}
        onValidate={(isValid, value) => {
          EventBus.publish('ui.field.validated', {
            fieldType: 'personnummer',
            isValid,
            value,
            component: 'CitizenRegistrationForm'
          });
        }}
      />

      <NorwegianAddressForm
        label="Adresse"
        required={true}
        accessibility={{
          landmark: 'region',
          labelledBy: 'address-group-label'
        }}
        postalCodeValidation={{
          realTime: true,
          postNorgeIntegration: true
        }}
        onChange={(addressData) => {
          EventBus.publish('ui.address.changed', {
            addressData,
            addressType: 'citizen_residence',
            validation: addressData.isValid
          });
        }}
      />

      <KommuneSelector
        label="Kommune"
        required={true}
        accessibility={{
          searchable: true,
          screenReaderOptimized: true
        }}
        dataSource="official_municipality_registry"
        onChange={(kommune) => {
          EventBus.publish('ui.kommune.selected', {
            kommuneNumber: kommune.number,
            kommuneName: kommune.name,
            fylke: kommune.fylke
          });
        }}
      />
    </Form>
  );
}
```

### Norwegian Government Service Portal

```typescript
import {
  GovernmentPortalLayout,
  CitizenServiceForm,
  ComplianceStatusIndicator
} from '@xala-technologies/ui-system';

function GovernmentServicePortal() {
  return (
    <GovernmentPortalLayout
      branding={{
        governmentEntity: 'Trondheim Kommune',
        logoUrl: '/assets/trondheim-logo.svg',
        primaryColor: '#0055B8'
      }}
      accessibility={{
        skipLinks: ['main-content', 'navigation', 'footer'],
        landmarkNavigation: true,
        keyboardShortcuts: true
      }}
      compliance={{
        nsmLevel: 'BASIC',
        gdprCompliant: true,
        digdirCertified: true,
        universalDesign: true
      }}
    >
      <Navigation
        type="government"
        items={[
          { key: 'services', label: 'Tjenester', href: '/tjenester' },
          { key: 'applications', label: 'Søknader', href: '/soknader' },
          { key: 'documents', label: 'Dokumenter', href: '/dokumenter' },
          { key: 'profile', label: 'Profil', href: '/profil' }
        ]}
        accessibility={{
          currentPage: 'services',
          ariaLabel: 'Hovednavigasjon',
          keyboardNavigation: true
        }}
      />

      <main id="main-content" role="main">
        <CitizenServiceForm
          serviceType="child_kindergarten_application"
          title="Søknad om barnehageplass"
          accessibility={{
            progressIndicator: true,
            sectionNavigation: true,
            saveAndContinue: true
          }}
          norwegianCompliance={{
            dataClassification: 'BEGRENSET',
            retentionPeriod: 'P7Y', // 7 years
            gdprBasis: 'public_task'
          }}
          onStepChange={(step, progress) => {
            EventBus.publish('ui.form.progress.changed', {
              formType: 'kindergarten_application',
              currentStep: step,
              progressPercentage: progress,
              accessibility: {
                announceProgress: true,
                updatePageTitle: true
              }
            });
          }}
        />

        <ComplianceStatusIndicator
          dataClassification="BEGRENSET"
          gdprStatus="compliant"
          nsmStatus="basic"
          accessibility={{
            role: 'status',
            ariaLive: 'polite',
            iconWithText: true
          }}
        />
      </main>
    </GovernmentPortalLayout>
  );
}
```

### Multi-Tenant Accessible Theme Provider

```typescript
import {
  ThemeProvider,
  AccessibilityProvider,
  NorwegianLocaleProvider
} from '@xala-technologies/ui-system';

function AccessibleMunicipalApp({ tenantConfig, userPreferences }) {
  return (
    <ThemeProvider
      tenant={tenantConfig}
      theme={{
        colors: tenantConfig.brandColors,
        typography: tenantConfig.typography,
        accessibility: {
          highContrast: userPreferences.highContrast,
          fontSize: userPreferences.fontSize, // 125%, 150%, 200%
          reducedMotion: userPreferences.reducedMotion
        }
      }}
      norwegianCompliance={{
        governmentBranding: tenantConfig.isGovernmentEntity,
        universalDesign: true,
        wcagLevel: 'AA'
      }}
    >
      <AccessibilityProvider
        preferences={userPreferences.accessibility}
        norwegianStandards={{
          universellUtforming: true,
          kontrastNivå: 'AAA',
          skriftStørrelse: userPreferences.fontSize
        }}
        onAccessibilityChange={(newSettings) => {
          EventBus.publish('ui.accessibility.settings.changed', {
            userId: userPreferences.userId,
            previousSettings: userPreferences.accessibility,
            newSettings: newSettings,
            changeType: 'user_preference'
          });
        }}
      >
        <NorwegianLocaleProvider
          locale={userPreferences.locale || 'nb'}
          supportedLocales={['nb', 'nn', 'en', 'se']}
          dateFormat="norwegian"
          numberFormat="norwegian"
          addressFormat="norwegian"
          onLocaleChange={(newLocale) => {
            EventBus.publish('ui.locale.changed', {
              userId: userPreferences.userId,
              previousLocale: userPreferences.locale,
              newLocale: newLocale,
              updateSource: 'user_selection'
            });
          }}
        >
          <MunicipalApp />
        </NorwegianLocaleProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
```

## 🎯 Success Criteria

UI System package is complete when:

- [ ] Only depends on foundation package (+ React/React Native)
- [ ] Norwegian government UI components implemented
- [ ] WCAG 2.2 AA + Universal Design compliance achieved
- [ ] Multi-platform support (React web + React Native) working
- [ ] Event-driven UI state management functional
- [ ] Multi-tenant theming system operational
- [ ] Norwegian formatting and validation complete
- [ ] Accessibility testing suite passing
- [ ] 90%+ component test coverage achieved
- [ ] Storybook documentation complete

## 📈 Next Steps

After ui-system completion:

1. Integrate with web-services for API-driven UI updates
2. Connect with norwegian-services for government UI workflows
3. Link with authentication for secure UI component access
4. Ensure all UI events flow to monitoring and analytics
5. Test complete citizen service UI user journeys across platforms
