# i18n-core

Internationalization support with Norwegian language features and government compliance.

## Features

- **Multi-language support** - Norwegian Bokmål, Nynorsk, Sami languages, and English
- **Norwegian formatting** - Currency, dates, numbers, postal codes, and ID numbers
- **Regional support** - Norwegian counties and municipalities localization
- **Government compliance** - Official Norwegian language standards and terminology
- **Dynamic loading** - Lazy loading of translation resources
- **Plural forms** - Advanced Norwegian plural form handling

## Usage

### Basic Translation

```typescript
import {
  initI18n,
  translate,
  setLanguage,
  formatNorwegianCurrency,
  formatNorwegianDate,
} from '@xala-technologies/foundation/i18n-core';

// Initialize with Norwegian support
await initI18n({
  defaultLanguage: 'nb', // Norwegian Bokmål
  supportedLanguages: ['nb', 'nn', 'se', 'en'],
  enableNorwegianFormatting: true,
});

// Basic translation
const message = translate('welcome_message', { name: 'Ola' });
// Output: "Velkommen, Ola!"

// Change language
setLanguage('nn'); // Switch to Norwegian Nynorsk
const nynorskMessage = translate('welcome_message', { name: 'Ola' });
// Output: "Velkomen, Ola!"
```

### Norwegian Formatting

```typescript
// Currency formatting (Norwegian Kroner)
const price = formatNorwegianCurrency(12500.5);
// Output: "12 500,50 kr"

// Date formatting
const date = formatNorwegianDate(new Date(), 'long');
// Output: "mandag 15. januar 2024"

// Number formatting
const number = formatNorwegianNumber(1234567.89);
// Output: "1 234 567,89"

// Postal code validation and formatting
const postalCode = formatNorwegianPostalCode('0150');
// Output: "0150 OSLO"
```

### Government Terminology

```typescript
import {
  getGovernmentTerms,
  translateMunicipalityName,
} from '@xala-technologies/foundation/i18n-core';

// Official government terms
const terms = getGovernmentTerms('nb');
console.log(terms.municipality); // "kommune"
console.log(terms.county); // "fylke"
console.log(terms.citizen); // "innbygger"

// Municipality name translation
const osloName = translateMunicipalityName('0301', 'nb');
// Output: "Oslo kommune"

const tromsøName = translateMunicipalityName('5401', 'se');
// Output: "Romsa suohkan" (Northern Sami)
```

### Advanced Features

```typescript
// Plural forms handling
const itemCount = (count: number) =>
  translate('item_count', {
    count,
    items: translatePlural('item', count, 'nb'),
  });

console.log(itemCount(0)); // "Du har 0 elementer"
console.log(itemCount(1)); // "Du har 1 element"
console.log(itemCount(5)); // "Du har 5 elementer"

// Regional dialects and variants
setRegionalVariant('nb', 'oslo'); // Oslo dialect
const greeting = translate('informal_greeting');
// Output: "Hei da!" (Oslo-specific informal greeting)

// Sami language support
setLanguage('se'); // Northern Sami
const samiGreeting = translate('welcome_message', { name: 'Niillas' });
// Output: "Bures boahtin, Niillas!"
```

## Translation File Structure

```json
{
  "nb": {
    "welcome_message": "Velkommen, {{name}}!",
    "municipality": "Kommune",
    "county": "Fylke",
    "error_messages": {
      "validation_failed": "Validering feilet",
      "access_denied": "Tilgang nektet"
    },
    "government_terms": {
      "citizen": "innbygger",
      "public_service": "offentlig tjeneste",
      "digital_citizen": "digital innbygger"
    }
  },
  "nn": {
    "welcome_message": "Velkomen, {{name}}!",
    "municipality": "Kommune",
    "county": "Fylke"
  },
  "se": {
    "welcome_message": "Bures boahtin, {{name}}!",
    "municipality": "suohkan",
    "county": "fylka"
  }
}
```

## Norwegian Language Features

### Language Variants

- **Norwegian Bokmål (nb)** - Primary written Norwegian standard
- **Norwegian Nynorsk (nn)** - Alternative written Norwegian standard
- **Northern Sami (se)** - Indigenous Sami language support
- **Regional dialects** - Support for regional Norwegian variants

### Formatting Standards

- **Currency** - Norwegian Kroner (NOK) with proper thousand separators
- **Dates** - Norwegian date formats and weekday/month names
- **Numbers** - Norwegian decimal comma and thousand space separators
- **Addresses** - Norwegian postal codes and municipality formatting
- **Phone numbers** - Norwegian phone number formatting (+47)

### Government Compliance

- **Official terminology** - Government-approved Norwegian terms
- **Accessibility** - WCAG 2.1 AA compliant text formatting
- **Legal language** - Proper legal and administrative Norwegian terms
- **Municipal support** - All 356 Norwegian municipalities supported

## Configuration

```typescript
const i18nConfig = {
  defaultLanguage: 'nb',
  supportedLanguages: ['nb', 'nn', 'se', 'en'],
  enableNorwegianFormatting: true,
  enableRegionalDialects: true,
  enableSamiLanguages: true,
  governmentTerminologyMode: true,
  accessibilityMode: true,
  dateFormat: 'norwegian_standard',
  currencyFormat: 'norwegian_kroner',
};
```

## Integration with Other Modules

- **Logger Module** - Localized log messages and error descriptions
- **Error Handler** - Translated error messages for different languages
- **Feature Toggle** - Language-specific feature availability
- **Config Loader** - Locale-specific configuration loading
