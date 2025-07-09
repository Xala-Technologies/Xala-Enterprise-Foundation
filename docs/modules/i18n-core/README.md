# I18n Core Module

The I18n Core module provides comprehensive internationalization with Norwegian language support (Bokmål and Nynorsk), GDPR compliance, and accessibility features.

## Overview

This module enables full Norwegian government application internationalization with built-in support for Bokmål, Nynorsk, accessibility requirements, and GDPR-compliant language processing.

## Key Features

- **Norwegian Language Support**: Full Bokmål and Nynorsk translation capabilities
- **Municipal Compliance**: Bergen Kommune Nynorsk requirements support
- **GDPR Compliance**: Language preference tracking with consent management
- **Accessibility**: WCAG 2.2 AA compliant text rendering
- **Dynamic Loading**: Efficient translation loading and caching

## Basic Usage

### Simple Translation

```typescript
import { t, setLocale } from '@xala-technologies/foundation';

// Set language for Oslo (Bokmål)
await setLocale('nb', { municipality: '0301' });

// Translate text
const welcomeMessage = t('welcome.message');
// Returns: "Velkommen til Oslo Kommune"

const buttonText = t('actions.submit');
// Returns: "Send inn"
```

### Nynorsk Support (Bergen Kommune)

```typescript
import { t, setLocale } from '@xala-technologies/foundation';

// Set language for Bergen (Nynorsk)
await setLocale('nn', { municipality: '4601' });

const welcomeMessage = t('welcome.message');
// Returns: "Velkomen til Bergen Kommune"

const buttonText = t('actions.submit');
// Returns: "Send inn"
```

### Pluralization

```typescript
import { tp } from '@xala-technologies/foundation';

// Norwegian pluralization
const citizenCount = tp('citizens.count', 5, { count: 5 });
// Returns: "5 innbyggjarar" (Nynorsk) or "5 innbyggere" (Bokmål)
```

## Configuration

### Language Configuration

```typescript
import { I18nManager } from '@xala-technologies/foundation';

const i18n = new I18nManager({
  defaultLocale: 'nb',
  supportedLocales: ['nb', 'nn', 'en'],
  fallbackLocale: 'nb',
  norwegian: {
    detectMunicipality: true,
    nynorskMunicipalities: ['4601'], // Bergen
    accessibilityCompliant: true,
  },
});
```

## API Reference

### Core Functions

#### `t(key, options?)`

Translates a text key to the current locale.

#### `tp(key, count, options?)`

Translates with pluralization support.

#### `setLocale(locale, context?)`

Sets the current locale with optional municipality context.

#### `getCurrentLocale()`

Gets the currently active locale.

## Norwegian Government Examples

### Bergen Kommune Nynorsk Interface

```typescript
import { setLocale, t } from '@xala-technologies/foundation';

// Automatically detect Bergen Kommune and use Nynorsk
await setLocale('nn', { municipality: '4601' });

const interface = {
  title: t('services.title'), // "Tenester"
  description: t('services.description'), // "Kommunale tenester for innbyggjarar"
  submitButton: t('actions.submit'), // "Send inn"
};
```

## Testing

```bash
# Run i18n specific tests
pnpm test i18n-core

# Run Norwegian language tests
pnpm test --testNamePattern="Norwegian"
```

## Related Documentation

- [Norwegian Compliance](../../compliance/norwegian-compliance.md)
