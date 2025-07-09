/**
 * Web Platform Storage
 */

export class WebStorageAdapter {
  private prefix = 'foundation-';

  async store(key: string, data: any) {
    localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(data));
  }

  async retrieve(key: string) {
    const stored = localStorage.getItem(`${this.prefix}${key}`);
    return stored ? JSON.parse(stored) : null;
  }
}
