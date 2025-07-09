/**
 * Mobile Storage
 * Basic React Native storage utilities
 */

export class MobileStorage {
  async store(key: string, data: any) {
    console.log('Mobile storage store:', key, data);
  }

  async retrieve(key: string) {
    console.log('Mobile storage retrieve:', key);
    return null;
  }
}
