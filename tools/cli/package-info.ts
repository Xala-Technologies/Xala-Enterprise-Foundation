/**
 * Foundation CLI - Package Information
 * Provides version and metadata for the CLI tool
 */

import fs from 'fs';
import path from 'path';

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
}

let packageInfoCache: PackageInfo | null = null;

/**
 * Get package information from package.json
 */
export function getPackageInfo(): PackageInfo {
  if (packageInfoCache) {
    return packageInfoCache;
  }

  try {
    // Try to read package.json from the project root
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(packageContent);

    packageInfoCache = {
      name: pkg.name || '@xala-technologies/foundation',
      version: pkg.version || '2.0.0',
      description: pkg.description || 'Norwegian government compliant foundation package',
      author: pkg.author || 'Xala Technologies',
      license: pkg.license || 'MIT',
    };
  } catch (error) {
    // Fallback to default values if package.json is not available
    packageInfoCache = {
      name: '@xala-technologies/foundation',
      version: '2.0.0',
      description: 'Norwegian government compliant foundation package',
      author: 'Xala Technologies',
      license: 'MIT',
    };
  }

  return packageInfoCache;
}

// Export the package info for easy access
export const packageInfo = getPackageInfo();
