# Platform Implementation Guide

Complete guide for implementing the Foundation package across all supported platforms: Web, Mobile, Desktop, and API services with Norwegian government compliance.

## 📖 Overview

This guide provides step-by-step instructions for implementing Foundation across different platforms while maintaining Norwegian government compliance, NSM security classifications, and GDPR requirements.

## 🌐 Web Platform Implementation

### Project Setup

#### 1. Create React Application with Foundation

```bash
# Create new React app with TypeScript
npx create-react-app oslo-citizen-portal --template typescript
cd oslo-citizen-portal

# Install Foundation web package
npm install @xala-technologies/foundation @xala-technologies/foundation/web

# Install additional dependencies for Norwegian compliance
npm install react-router-dom axios date-fns
```

#### 2. Foundation Configuration

Create `src/config/foundation.config.ts`:

```typescript
import { FoundationConfig } from '@xala-technologies/foundation';

export const foundationConfig: FoundationConfig = {
  name: 'oslo-citizen-portal',
  version: '1.0.0',
  platform: 'web',
  environment: process.env.NODE_ENV as 'development' | 'production' | 'test',

  // Norwegian municipality configuration
  municipality: {
    code: '0301',
    name: 'Oslo',
    region: 'Østlandet',
    population: 695000,
    contactInfo: {
      email: 'post@oslo.kommune.no',
      phone: '+47 21 80 21 80',
      website: 'https://www.oslo.kommune.no',
    },
  },

  // NSM security configuration
  nsm: {
    enabled: true,
    defaultClassification: 'BEGRENSET',
    encryptionRequired: true,
    auditRequired: true,
    classifications: {
      ÅPEN: {
        encryptionRequired: false,
        auditLevel: 'basic',
      },
      BEGRENSET: {
        encryptionRequired: true,
        auditLevel: 'standard',
      },
      KONFIDENSIELT: {
        encryptionRequired: true,
        auditLevel: 'comprehensive',
      },
    },
  },

  // GDPR compliance configuration
  gdpr: {
    enabled: true,
    consentRequired: true,
    dataRetentionPeriod: 'P7Y', // 7 years
    rightToErasure: true,
    dataPortability: true,
    dataProtectionOfficer: {
      name: 'Oslo Kommune DPO',
      email: 'dpo@oslo.kommune.no',
      phone: '+47 21 80 21 80',
    },
  },

  // Localization configuration
  localization: {
    defaultLanguage: 'nb-NO',
    supportedLanguages: ['nb-NO', 'nn-NO', 'en-US'],
    fallbackLanguage: 'nb-NO',
    enableRTL: false,
  },

  // Authentication configuration
  authentication: {
    provider: 'id_porten',
    clientId: process.env.REACT_APP_ID_PORTEN_CLIENT_ID!,
    redirectUri: `${window.location.origin}/auth/callback`,
    scopes: ['openid', 'profile', 'krr:global/kontaktinformasjon.read'],
    responseType: 'code',
    codeChallenge: true,
  },
};
```

#### 3. App Integration

Update `src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FoundationProvider } from '@xala-technologies/foundation/web';
import { foundationConfig } from './config/foundation.config';

// Components
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Profile from './pages/Profile';
import AuthCallback from './components/AuthCallback';

function App() {
  return (
    <FoundationProvider config={foundationConfig}>
      <Router>
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/services" element={<Services />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FoundationProvider>
  );
}

export default App;
```

#### 4. Authentication Implementation

Create `src/components/AuthCallback.tsx`:

```typescript
import React, { useEffect } from 'react';
import { useFoundation } from '@xala-technologies/foundation/web';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const { auth, logger } = useFoundation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          const tokens = await auth.handleIDPortenCallback(window.location.search);
          const userProfile = await auth.getUserProfile(tokens.access_token);

          await logger.audit({
            action: 'user_login',
            userId: userProfile.sub,
            entityType: 'authentication',
            entityId: `auth_${userProfile.sub}`,
            nsmClassification: 'BEGRENSET',
            personalDataIncluded: true,
            legalBasis: 'ID-porten Authentication',
            dataCategories: ['authentication', 'personal_identification'],
            purpose: 'user_authentication',
            retentionPeriod: 'P30D'
          });

          navigate('/dashboard');
        }
      } catch (error) {
        await logger.error('Authentication callback failed', error, {
          nsmClassification: 'BEGRENSET'
        });
        navigate('/login?error=authentication_failed');
      }
    };

    handleCallback();
  }, [auth, logger, navigate]);

  return (
    <div className="auth-callback">
      <p>Autentiserer bruker...</p>
    </div>
  );
};

export default AuthCallback;
```

### Advanced Web Features

#### Progressive Web App Configuration

Create `public/manifest.json`:

```json
{
  "name": "Oslo Borgertjenester",
  "short_name": "Oslo Portal",
  "description": "Digitale tjenester for Oslo kommune",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0051A3",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "lang": "nb-NO",
  "scope": "/",
  "orientation": "portrait"
}
```

## 📱 Mobile Platform Implementation

### React Native Setup

#### 1. Project Initialization

```bash
# Create React Native app
npx react-native init BergenMunicipalApp --template react-native-template-typescript
cd BergenMunicipalApp

# Install Foundation mobile package
npm install @xala-technologies/foundation @xala-technologies/foundation/mobile

# Install React Native dependencies
npm install @react-native-async-storage/async-storage react-native-keychain
npm install react-native-biometrics react-native-push-notification

# iOS specific setup
cd ios && pod install && cd ..
```

#### 2. Mobile Configuration

Create `src/config/foundation.mobile.config.ts`:

```typescript
import { FoundationConfig } from '@xala-technologies/foundation';

export const mobileFoundationConfig: FoundationConfig = {
  name: 'bergen-municipal-app',
  version: '1.0.0',
  platform: 'mobile',
  environment: __DEV__ ? 'development' : 'production',

  municipality: {
    code: '4601',
    name: 'Bergen',
    region: 'Vestlandet',
  },

  nsm: {
    enabled: true,
    defaultClassification: 'BEGRENSET',
    encryptionRequired: true,
  },

  gdpr: {
    enabled: true,
    consentRequired: true,
    dataRetentionPeriod: 'P5Y',
  },

  // Mobile-specific configuration
  mobile: {
    enableBiometrics: true,
    enablePushNotifications: true,
    enableOfflineSync: true,
    secureStorage: 'keychain',
    backgroundSyncInterval: 300000, // 5 minutes
    maxOfflineStorage: '100MB',
  },
};
```

#### 3. Mobile App Structure

Update `App.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FoundationMobileProvider } from '@xala-technologies/foundation/mobile';
import { mobileFoundationConfig } from './src/config/foundation.mobile.config';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <FoundationMobileProvider config={mobileFoundationConfig}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'Bergen Kommune' }}
          />
          <Stack.Screen
            name="Services"
            component={ServicesScreen}
            options={{ title: 'Tjenester' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Min Profil' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FoundationMobileProvider>
  );
};

export default App;
```

#### 4. Biometric Authentication

Create `src/services/BiometricAuth.ts`:

```typescript
import { FoundationMobileAuth } from '@xala-technologies/foundation/mobile';
import ReactNativeBiometrics from 'react-native-biometrics';

export class BiometricAuthService {
  private auth: FoundationMobileAuth;

  constructor(auth: FoundationMobileAuth) {
    this.auth = auth;
  }

  async setupBiometrics(): Promise<boolean> {
    try {
      const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();

      if (available) {
        const { success } = await ReactNativeBiometrics.createKeys();

        await this.auth.logger.info('Biometric authentication configured', {
          biometryType,
          success,
          municipality: '4601',
          nsmClassification: 'BEGRENSET',
        });

        return success;
      }

      return false;
    } catch (error) {
      await this.auth.logger.error('Biometric setup failed', error);
      return false;
    }
  }

  async authenticateWithBiometrics(): Promise<boolean> {
    try {
      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Bekreft din identitet',
        cancelButtonText: 'Avbryt',
      });

      if (success) {
        await this.auth.logger.audit({
          action: 'biometric_authentication',
          userId: await this.auth.getCurrentUserId(),
          entityType: 'authentication',
          entityId: 'biometric_auth',
          nsmClassification: 'BEGRENSET',
          personalDataIncluded: true,
          legalBasis: 'User Authentication',
          dataCategories: ['biometric_data'],
          purpose: 'secure_authentication',
          retentionPeriod: 'P30D',
        });
      }

      return success;
    } catch (error) {
      await this.auth.logger.error('Biometric authentication failed', error);
      return false;
    }
  }
}
```

## 🖥️ Desktop Platform Implementation

### Electron Application Setup

#### 1. Project Creation

```bash
# Create Electron app with Foundation
npm create electron-app@latest trondheim-admin-portal -- --template=typescript
cd trondheim-admin-portal

# Install Foundation desktop package
npm install @xala-technologies/foundation @xala-technologies/foundation/desktop

# Install Electron dependencies
npm install electron-store electron-updater electron-builder
```

#### 2. Desktop Configuration

Create `src/config/foundation.desktop.config.ts`:

```typescript
import { FoundationConfig } from '@xala-technologies/foundation';

export const desktopFoundationConfig: FoundationConfig = {
  name: 'trondheim-admin-portal',
  version: '1.0.0',
  platform: 'desktop',
  environment: process.env.NODE_ENV as 'development' | 'production',

  municipality: {
    code: '5001',
    name: 'Trondheim',
    region: 'Trøndelag',
  },

  nsm: {
    enabled: true,
    defaultClassification: 'KONFIDENSIELT',
    encryptionRequired: true,
    auditRequired: true,
  },

  gdpr: {
    enabled: true,
    consentRequired: true,
    dataRetentionPeriod: 'P10Y',
  },

  // Desktop-specific configuration
  desktop: {
    enableAutoUpdater: true,
    enableSystemIntegration: true,
    secureStorage: 'electron_store',
    windowSecurity: 'strict',
    enableDeepLinking: true,
    offlineCapabilities: true,
  },
};
```

#### 3. Main Process Setup

Update `src/main.ts`:

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import { FoundationDesktopSetup } from '@xala-technologies/foundation/desktop';
import { desktopFoundationConfig } from './config/foundation.desktop.config';

class TrondheimAdminPortal {
  private mainWindow: BrowserWindow | null = null;
  private foundationDesktop: FoundationDesktopSetup;

  constructor() {
    this.foundationDesktop = new FoundationDesktopSetup(desktopFoundationConfig);
  }

  async initialize(): Promise<void> {
    await this.foundationDesktop.start();

    // Setup IPC handlers
    this.setupIPCHandlers();

    // Create main window
    this.createMainWindow();
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
      },
      show: false,
      title: 'Trondheim Kommune - Administratorportalen',
    });

    // Load the app
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
    } else {
      this.mainWindow.loadFile('dist/index.html');
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });
  }

  private setupIPCHandlers(): void {
    // Handle secure storage operations
    ipcMain.handle(
      'secure-storage-set',
      async (event, key: string, value: any, classification: string) => {
        return await this.foundationDesktop.secureStorage.setItem(key, value, {
          nsmClassification: classification,
          encrypt: true,
        });
      }
    );

    ipcMain.handle('secure-storage-get', async (event, key: string) => {
      return await this.foundationDesktop.secureStorage.getItem(key);
    });

    // Handle audit logging
    ipcMain.handle('audit-log', async (event, auditEntry: any) => {
      return await this.foundationDesktop.logger.audit(auditEntry);
    });
  }
}

// App lifecycle
app.whenReady().then(async () => {
  const portal = new TrondheimAdminPortal();
  await portal.initialize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

## 🔌 API Platform Implementation

### Express.js Backend Service

#### 1. Project Setup

```bash
# Create Express TypeScript project
mkdir stavanger-municipal-api
cd stavanger-municipal-api

npm init -y
npm install express cors helmet morgan compression
npm install @xala-technologies/foundation @xala-technologies/foundation/api
npm install --save-dev @types/express @types/cors typescript nodemon

# Create TypeScript configuration
npx tsc --init
```

#### 2. API Configuration

Create `src/config/foundation.api.config.ts`:

```typescript
import { FoundationConfig } from '@xala-technologies/foundation';

export const apiFoundationConfig: FoundationConfig = {
  name: 'stavanger-municipal-api',
  version: '1.0.0',
  platform: 'api',
  environment: process.env.NODE_ENV as 'development' | 'production' | 'test',

  municipality: {
    code: '1103',
    name: 'Stavanger',
    region: 'Rogaland',
  },

  nsm: {
    enabled: true,
    defaultClassification: 'BEGRENSET',
    encryptionRequired: true,
    auditRequired: true,
  },

  gdpr: {
    enabled: true,
    consentRequired: true,
    dataRetentionPeriod: 'P7Y',
  },

  // API-specific configuration
  api: {
    port: parseInt(process.env.PORT || '3000'),
    enableCORS: true,
    enableHelmet: true,
    enableCompression: true,
    rateLimit: {
      windowMs: 900000, // 15 minutes
      max: 100, // requests per window
    },
    authentication: {
      jwtSecret: process.env.JWT_SECRET!,
      tokenExpiry: '1h',
      refreshTokenExpiry: '7d',
    },
  },
};
```

#### 3. Server Setup

Create `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { FoundationAPISetup } from '@xala-technologies/foundation/api';
import { apiFoundationConfig } from './config/foundation.api.config';

// Route imports
import healthRoutes from './routes/health';
import citizenRoutes from './routes/citizens';
import servicesRoutes from './routes/services';

class StavangerMunicipalAPI {
  private app: express.Application;
  private foundationAPI: FoundationAPISetup;

  constructor() {
    this.app = express();
    this.foundationAPI = new FoundationAPISetup(apiFoundationConfig);
  }

  async initialize(): Promise<void> {
    // Initialize Foundation API
    await this.foundationAPI.start();

    // Configure middleware
    this.configureMiddleware();

    // Setup routes
    this.setupRoutes();

    // Start server
    this.startServer();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      })
    );

    // Performance middleware
    this.app.use(compression());

    // Logging middleware with Foundation
    this.app.use(
      morgan('combined', {
        stream: {
          write: (message: string) => {
            this.foundationAPI.logger.info('HTTP Request', {
              message: message.trim(),
              nsmClassification: 'ÅPEN',
            });
          },
        },
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Foundation middleware
    this.app.use(this.foundationAPI.middleware.auditLogging);
    this.app.use(this.foundationAPI.middleware.nsmClassification);
    this.app.use(this.foundationAPI.middleware.gdprCompliance);
  }

  private setupRoutes(): void {
    // Health check routes
    this.app.use('/health', healthRoutes);

    // API routes with authentication
    this.app.use('/api/citizens', this.foundationAPI.middleware.authenticate, citizenRoutes);

    this.app.use('/api/services', this.foundationAPI.middleware.authenticate, servicesRoutes);

    // Error handling
    this.app.use(this.foundationAPI.middleware.errorHandler);
  }

  private startServer(): void {
    const port = apiFoundationConfig.api?.port || 3000;

    this.app.listen(port, () => {
      this.foundationAPI.logger.info(`Stavanger Municipal API started on port ${port}`, {
        port,
        environment: apiFoundationConfig.environment,
        municipality: '1103',
        nsmClassification: 'ÅPEN',
      });
    });
  }
}

// Start the server
const api = new StavangerMunicipalAPI();
api.initialize().catch(error => {
  console.error('Failed to start API server:', error);
  process.exit(1);
});
```

#### 4. Service Implementation

Create `src/routes/citizens.ts`:

```typescript
import { Router } from 'express';
import { FoundationAPIController } from '@xala-technologies/foundation/api';

const router = Router();

class CitizenController extends FoundationAPIController {
  async getCitizenProfile(req: any, res: any): Promise<void> {
    try {
      const citizenId = req.params.id;

      // Validate access permissions
      await this.validateAccess(req.user, 'citizen_data', 'KONFIDENSIELT');

      // Audit data access
      await this.logger.audit({
        action: 'citizen_profile_access',
        userId: req.user.id,
        entityType: 'citizen_profile',
        entityId: citizenId,
        nsmClassification: 'KONFIDENSIELT',
        personalDataIncluded: true,
        legalBasis: 'Municipal Service Delivery',
        dataCategories: ['personal_identification', 'contact_information'],
        purpose: 'service_delivery',
        retentionPeriod: 'P7Y',
      });

      // Get citizen data (mock implementation)
      const citizenData = await this.getCitizenData(citizenId);

      // Apply NSM classification
      const classifiedResponse = await this.applyNSMClassification(citizenData, 'KONFIDENSIELT');

      res.json(classifiedResponse);
    } catch (error) {
      await this.handleError(error, req, res);
    }
  }

  private async getCitizenData(citizenId: string): Promise<any> {
    // Mock citizen data - replace with actual database call
    return {
      id: citizenId,
      name: 'Kari Nordmann',
      address: 'Stavanger Gate 123, 4001 Stavanger',
      phone: '+47 12345678',
      email: 'kari.nordmann@example.com',
      municipalityCode: '1103',
      services: ['health', 'education', 'social_services'],
    };
  }
}

const citizenController = new CitizenController();

// Routes
router.get('/:id', citizenController.getCitizenProfile.bind(citizenController));

export default router;
```

## 🔄 Cross-Platform Data Synchronization

### Shared Data Layer

Create `src/shared/DataSync.ts`:

```typescript
import { FoundationDataSync } from '@xala-technologies/foundation/shared';

export class MunicipalDataSync {
  private dataSync: FoundationDataSync;

  constructor(config: FoundationConfig) {
    this.dataSync = new FoundationDataSync(config);
  }

  async syncCitizenData(citizenId: string): Promise<void> {
    await this.dataSync.sync({
      entityType: 'citizen_profile',
      entityId: citizenId,
      platforms: ['web', 'mobile', 'desktop'],
      nsmClassification: 'KONFIDENSIELT',
      syncStrategy: 'eventual_consistency',
      conflictResolution: 'server_wins',
    });
  }

  async syncMunicipalServices(): Promise<void> {
    await this.dataSync.sync({
      entityType: 'municipal_services',
      platforms: ['web', 'mobile'],
      nsmClassification: 'ÅPEN',
      syncStrategy: 'real_time',
      cacheStrategy: 'cache_first',
    });
  }
}
```

## 📞 Support and Resources

### Platform-Specific Documentation

- [Web Platform API](../api-reference/platforms/web.md)
- [Mobile Platform API](../api-reference/platforms/mobile.md)
- [Desktop Platform API](../api-reference/platforms/desktop.md)
- [API Platform Reference](../api-reference/platforms/api.md)

### Code Examples

- [Complete Platform Examples](../examples/)
- [Norwegian Municipal Implementations](../examples/municipal/)

### Performance Optimization

- [Cross-Platform Performance](./performance-optimization.md)
- [Security Best Practices](./security-best-practices.md)

---

**Version**: 2.0.0  
**Updated**: January 2024  
**Compatibility**: All Foundation supported platforms
