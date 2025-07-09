# Phase 2: Simplify Package Dependencies

**Status**: 📋 PLANNED  
**Story Points**: 18

## 🎯 **PHASE OBJECTIVE**

Remove all inter-package dependencies except foundation and implement event-driven communication patterns.

## 📋 **IMPLEMENTATION TASKS**

### **Story 1: Dependency Analysis and Planning (3 points)**

- [ ] Audit all package.json files for inter-package dependencies
- [ ] Map direct dependencies between packages to identify circular dependencies
- [ ] Create dependency elimination plan for each package
- [ ] Document required communication patterns for event-driven approach
- [ ] Plan service interface contracts for event-based communication

### **Story 2: Update Authentication Package (3 points)**

- [ ] Remove dependencies on other packages except foundation
- [ ] Update authentication/src/modules/ to use foundation's security module
- [ ] Implement event publishing for authentication events (login, logout, token refresh)
- [ ] Update authentication interfaces to use foundation's type definitions
- [ ] Test authentication package works with foundation-only dependencies
- [ ] Update package.json to have only foundation dependency

### **Story 3: Update Business Services Package (4 points)**

- [ ] Remove dependencies on other packages except foundation
- [ ] Update business-services/src/modules/ to use foundation's types and utilities
- [ ] Implement event-driven communication for business workflows
- [ ] Replace direct service calls with event publish/subscribe patterns
- [ ] Update API client module to use foundation's configuration
- [ ] Test business services work with foundation-only dependencies
- [ ] Update package.json to have only foundation dependency

### **Story 4: Update Data Services Package (3 points)**

- [ ] Remove dependencies on other packages except foundation
- [ ] Update database modules to use foundation's configuration and logging
- [ ] Implement data change events for Norwegian audit compliance
- [ ] Update validation modules to use foundation's compliance utilities
- [ ] Test data services work with foundation-only dependencies
- [ ] Update package.json to have only foundation dependency

### **Story 5: Update Norwegian Services Package (3 points)**

- [ ] Remove dependencies on other packages except foundation
- [ ] Update Norwegian service modules to use foundation's compliance utilities
- [ ] Implement government API events for NSM audit requirements
- [ ] Update authentication flows to use foundation's security patterns
- [ ] Test Norwegian services work with foundation-only dependencies
- [ ] Update package.json to have only foundation dependency

### **Story 6: Update Monitoring Services Package (2 points)**

- [ ] Remove dependencies on other packages except foundation
- [ ] Update monitoring modules to use foundation's logging and events
- [ ] Implement security monitoring events for NSM compliance
- [ ] Update performance monitoring to use foundation's utilities
- [ ] Test monitoring services work with foundation-only dependencies
- [ ] Update package.json to have only foundation dependency

## ✅ **PHASE COMPLETION CRITERIA**

- [ ] All packages have zero dependencies except foundation
- [ ] Event-driven communication patterns implemented across all services
- [ ] No direct service-to-service calls remain
- [ ] All package builds work independently after foundation
- [ ] Norwegian compliance audit trails maintained through events
- [ ] All tests pass with new dependency structure

## 🚧 **TESTING REQUIREMENTS**

- [ ] Unit tests pass for each package in isolation
- [ ] Integration tests verify event-driven workflows
- [ ] End-to-end tests confirm all functionality preserved
- [ ] Performance tests show no degradation from event patterns
- [ ] Norwegian compliance tests verify audit event integrity

## 📝 **DELIVERABLES**

- [ ] All packages updated with foundation-only dependencies
- [ ] Event-driven communication patterns documented
- [ ] Migration guide for event-based service communication
- [ ] Updated package.json files with clean dependencies
- [ ] Norwegian compliance audit event specifications
