/**
 * Desktop Storage - Electron file system storage
 */

export function setItem(key: string, value: any): void {
  console.log(`Setting desktop storage: ${key}`, value);
}

export function getItem(key: string): void {
  console.log(`Getting desktop storage: ${key}`);
}
