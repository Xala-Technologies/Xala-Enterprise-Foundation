# feature-toggle

Feature flag management with Norwegian compliance and sophisticated targeting capabilities.

## Features

- **Feature flag management** - Create, update, and delete feature flags
- **User targeting** - Target specific users, groups, organizations, municipalities
- **Rollout controls** - Gradual feature rollouts with percentage controls
- **Norwegian compliance** - NSM classification and compliance-aware access control
- **Audit logging** - Track all flag operations and evaluations
- **Municipality support** - Norwegian municipality-specific feature targeting

## Usage

### Basic Feature Flags

```typescript
import {
  getFeatureToggleManager,
  isFeatureEnabled,
} from '@xala-technologies/foundation/feature-toggle';

const manager = getFeatureToggleManager();

// Register a feature flag
manager.registerFlag({
  key: 'new-dashboard',
  name: 'New Dashboard UI',
  description: 'Enable the redesigned dashboard interface',
  enabled: true,
  rolloutPercentage: 50,
});

// Check if feature is enabled
const userContext = { userId: 'user_123', municipality: '0301' }; // Oslo
const isEnabled = isFeatureEnabled('new-dashboard', userContext);
```

### Norwegian Municipality Targeting

```typescript
// Target specific Norwegian municipalities
manager.registerFlag({
  key: 'oslo-pilot',
  name: 'Oslo Pilot Program',
  description: 'Pilot features for Oslo municipality',
  enabled: true,
  targeting: {
    municipalities: ['0301'], // Oslo municipality code
  },
});

// Check municipality-specific feature
const isOsloFeatureEnabled = manager.isMunicipalityFeatureEnabled(
  'oslo-pilot',
  '0301',
  userContext
);
```

### NSM Classified Features

```typescript
// Create NSM classified feature
manager.registerFlag({
  key: 'security-dashboard',
  name: 'Security Operations Dashboard',
  description: 'Enhanced security monitoring tools',
  enabled: true,
  nsmClassification: 'KONFIDENSIELT',
  targeting: {
    userGroups: ['security-operators'],
  },
});
```

## Norwegian Compliance Features

- **NSM Classifications** - Support for all Norwegian security levels
- **Municipality Targeting** - Target by Norwegian municipality codes
- **Regional Controls** - Norwegian regional feature deployment
- **Audit Compliance** - Track all flag evaluations for compliance reporting
