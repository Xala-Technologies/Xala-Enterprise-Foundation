/**
 * API Metrics
 */

export class APIMetrics {
  recordRequest(path: string, duration: number) {
    // Debug: API request recorded
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('API request recorded:', path, duration);
    }
  }
}

/**
 * API Metrics - Server-side metrics collection
 */

export function collectApiMetrics(): void {
  // Debug: Collecting API metrics
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('Collecting API metrics');
  }
}
