# Foundation Package Multi-Platform Migration Analysis

## Current State Assessment

### Dependencies Analysis

**Current (Minimal)**:

- Runtime: `pino` for logging
- Build: Basic TypeScript compilation
- Test: Jest with basic setup
- Size: ~118.6 kB packed

**Required New Dependencies**:

#### Core Multi-Platform Dependencies

```json
{
  "dependencies": {
    "pino": "^9.7.0", // Keep existing
    "eventemitter3": "^5.0.1", // Better event handling
    "uuid": "^9.0.1", // Cross-platform UUID generation
    "lodash": "^4.17.21", // Utilities
    "date-fns": "^2.30.0", // Date handling
    "zod": "^3.22.4" // Runtime validation
  }
}
```

#### Platform-Specific Dependencies

```json
{
  "peerDependencies": {
    "react": ">=18.0.0", // Web/Mobile platforms
    "react-native": ">=0.72.0", // Mobile platform
    "electron": ">=25.0.0" // Desktop platform
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-native": { "optional": true },
    "electron": { "optional": true }
  }
}
```

#### Build System Dependencies

```json
{
  "devDependencies": {
    "@rollup/plugin-typescript": "^11.1.5",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-commonjs": "^25.0.7",
    "rollup": "^4.6.1",
    "typedoc": "^0.25.4",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

## Platform Structure Plan

### Directory Structure Changes

```
Current:
foundation/
├── src/ (9 modules)
└── docs/

Proposed:
foundation/
├── src/ (enhanced 9 modules)
├── platforms/
│   ├── web/
│   ├── mobile/
│   ├── desktop/
│   └── api/
├── tools/
├── examples/
└── docs/ (expanded)
```

## Entry Points Strategy

### Package.json Exports Configuration

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./web": {
      "import": "./dist/platforms/web/index.esm.js",
      "require": "./dist/platforms/web/index.js",
      "types": "./dist/platforms/web/index.d.ts"
    },
    "./mobile": {
      "import": "./dist/platforms/mobile/index.esm.js",
      "require": "./dist/platforms/mobile/index.js",
      "types": "./dist/platforms/mobile/index.d.ts"
    },
    "./desktop": {
      "import": "./dist/platforms/desktop/index.esm.js",
      "require": "./dist/platforms/desktop/index.js",
      "types": "./dist/platforms/desktop/index.d.ts"
    },
    "./api": {
      "import": "./dist/platforms/api/index.esm.js",
      "require": "./dist/platforms/api/index.js",
      "types": "./dist/platforms/api/index.d.ts"
    }
  }
}
```

## Build System Changes

### Current: Simple TypeScript

```bash
tsc
```

### Proposed: Multi-Target Rollup

```bash
rollup -c  # Build all platforms
rollup -c --platform=web     # Build web only
rollup -c --platform=mobile  # Build mobile only
```

## Migration Risks & Mitigation

### High Risk Areas

1. **Breaking Changes**: Import paths will change
   - Mitigation: Maintain backward compatibility in main export
2. **Bundle Size**: Will increase with platform code
   - Mitigation: Tree-shaking and platform-specific bundles
3. **Complexity**: Build system becomes more complex
   - Mitigation: Gradual rollout and comprehensive testing

### Low Risk Areas

1. **Core Module Logic**: Existing functionality preserved
2. **Norwegian Compliance**: All existing features maintained
3. **Test Coverage**: Existing tests continue working

## Implementation Phases

### Phase 1: Platform Structure (2-3 days)

- Create platforms/ directory
- Basic platform entry points
- Update TypeScript configs

### Phase 2: Enhanced Core Modules (5-7 days)

- Add platform-specific implementations
- Enhance existing 9 modules
- Maintain backward compatibility

### Phase 3: Build System (3-4 days)

- Rollup configuration
- Multi-entry point setup
- Platform-specific builds

### Phase 4: Tools & Examples (4-5 days)

- CLI tools
- Compliance checkers
- Municipal examples

## Success Metrics

### Technical Metrics

- ✅ All existing tests continue passing
- ✅ Build time remains under 30 seconds
- ✅ Bundle size optimized per platform
- ✅ TypeScript compilation with zero errors

### User Experience Metrics

- ✅ Backward compatibility maintained
- ✅ Platform-specific optimizations working
- ✅ Documentation covers all platforms
- ✅ Migration guide available

## Next Steps

1. ✅ Complete dependency analysis
2. 🔄 Create platform structure
3. ⏳ Enhance core modules
4. ⏳ Setup build pipeline
5. ⏳ Create examples and documentation

This migration transforms our foundation from a simple shared library into a comprehensive multi-platform development framework optimized for Norwegian government applications.
