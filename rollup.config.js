import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// Common plugins for all builds
const getBasePlugins = platform => [
  resolve({
    browser: platform === 'web',
    preferBuiltins: platform === 'api' || platform === 'desktop',
    exportConditions: platform === 'web' ? ['browser'] : ['node'],
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.build.json',
    declaration: false,
    declarationMap: false,
    sourceMap: isDevelopment,
    inlineSources: isDevelopment,
  }),
];

// Platform-specific external dependencies
const getExternals = platform => {
  const commonExternals = ['events', 'crypto', 'util', 'path', 'fs', 'os'];

  const platformExternals = {
    web: ['react', 'react-dom', 'react-router-dom'],
    mobile: [
      'react',
      'react-native',
      '@react-native-async-storage/async-storage',
      'react-native-keychain',
      'react-native-biometrics',
    ],
    desktop: ['electron', 'electron-store', 'electron-updater'],
    api: ['express', 'cors', 'helmet', 'compression', 'jsonwebtoken'],
  };

  return platform === 'core' ? [] : [...commonExternals, ...(platformExternals[platform] || [])];
};

// Core Foundation build configuration
const coreConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: isDevelopment,
      exports: 'named',
      interop: 'auto',
      esModule: false,
      banner: '/* @xala-technologies/foundation v2.0.0 - Core Foundation Package */',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: isDevelopment,
      exports: 'named',
      banner: '/* @xala-technologies/foundation v2.0.0 - Core Foundation Package */',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'Foundation',
      sourcemap: isDevelopment,
      exports: 'named',
      globals: {
        events: 'events',
        crypto: 'crypto',
      },
      banner: '/* @xala-technologies/foundation v2.0.0 - Core Foundation Package */',
    },
  ],
  external: getExternals('core'),
  plugins: getBasePlugins('core'),
};

// Platform-specific build configurations
const platformConfigs = ['web', 'mobile', 'desktop', 'api'].map(platform => ({
  input: `platforms/${platform}/index.ts`,
  output: [
    {
      file: `dist/platforms/${platform}/index.js`,
      format: 'cjs',
      sourcemap: isDevelopment,
      exports: 'named',
      banner: `/* @xala-technologies/foundation v2.0.0 - ${platform.charAt(0).toUpperCase() + platform.slice(1)} Platform */`,
    },
    {
      file: `dist/platforms/${platform}/index.esm.js`,
      format: 'es',
      sourcemap: isDevelopment,
      exports: 'named',
      banner: `/* @xala-technologies/foundation v2.0.0 - ${platform.charAt(0).toUpperCase() + platform.slice(1)} Platform */`,
    },
  ],
  external: getExternals(platform),
  plugins: getBasePlugins(platform),
}));

// CLI Tools build configuration
const toolsConfig = {
  input: 'tools/cli/index.ts',
  output: {
    file: 'dist/tools/cli/index.js',
    format: 'cjs',
    sourcemap: isDevelopment,
    exports: 'named',
    banner: '#!/usr/bin/env node\n/* @xala-technologies/foundation-cli v2.0.0 */',
  },
  external: ['fs', 'path', 'process', 'commander', 'chalk', 'inquirer', 'ora', 'boxen'],
  plugins: getBasePlugins('cli'),
};

// TypeScript declaration files configuration - simplified
const declarationConfigs = [
  // Core declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: () => true,
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        emitDeclarationOnly: true,
        outDir: 'dist',
      }),
    ],
  },
];

// Export all configurations
export default [coreConfig, ...platformConfigs, toolsConfig, ...declarationConfigs];
