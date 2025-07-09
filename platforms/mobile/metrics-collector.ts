/**
 * Mobile Metrics Collector
 */

export class MobileMetricsCollector {
  recordPerformance(operation: string, duration: number) {
    console.log('Mobile performance recorded:', operation, duration);
  }

  recordEvent(event: string, data: any) {
    console.log('Mobile event recorded:', event, data);
  }
}
