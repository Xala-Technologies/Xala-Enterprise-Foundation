/**
 * Metrics SDK Module
 * Application metrics collection and monitoring with Norwegian compliance
 */

export interface MetricValue {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
  unit?: string;
  metadata?: Record<string, any>;
}

export interface HistogramBucket {
  le: number; // less than or equal to
  count: number;
}

export interface Histogram {
  buckets: HistogramBucket[];
  sum: number;
  count: number;
}

export interface MetricsOptions {
  enableCompliance?: boolean;
  enableHistograms?: boolean;
  defaultLabels?: Record<string, string>;
  flushInterval?: number;
  maxMetrics?: number;
}

export class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private timers: Map<string, number> = new Map();
  private metrics: MetricValue[] = [];
  private options: MetricsOptions;
  private flushTimer?: NodeJS.Timeout;

  constructor(options: MetricsOptions = {}) {
    this.options = {
      enableCompliance: true,
      enableHistograms: true,
      defaultLabels: {},
      flushInterval: 60000, // 1 minute
      maxMetrics: 10000,
      ...options,
    };

    if (this.options.flushInterval && this.options.flushInterval > 0) {
      this.startAutoFlush();
    }
  }

  // Increment counter
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.createKey(name, labels);
    const currentValue = this.counters.get(key) || 0;
    this.counters.set(key, currentValue + value);

    this.recordMetric({
      name,
      value: currentValue + value,
      timestamp: new Date(),
      labels: { ...this.options.defaultLabels, ...labels },
      unit: 'count',
    });
  }

  // Set gauge value
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.createKey(name, labels);
    this.gauges.set(key, value);

    this.recordMetric({
      name,
      value,
      timestamp: new Date(),
      labels: { ...this.options.defaultLabels, ...labels },
      unit: 'gauge',
    });
  }

  // Record histogram value
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.options.enableHistograms) return;

    const key = this.createKey(name, labels);
    let histogram = this.histograms.get(key);

    if (!histogram) {
      histogram = this.createHistogram();
      this.histograms.set(key, histogram);
    }

    this.updateHistogram(histogram, value);

    this.recordMetric({
      name,
      value,
      timestamp: new Date(),
      labels: { ...this.options.defaultLabels, ...labels },
      unit: 'histogram',
      metadata: { histogram: this.serializeHistogram(histogram) },
    });
  }

  // Start timer
  startTimer(name: string): string {
    const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, Date.now());
    return timerId;
  }

  // End timer and record duration
  endTimer(timerId: string, labels?: Record<string, string>): number {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      console.warn(`Timer ${timerId} not found`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(timerId);

    // Extract name from timer ID
    const name = timerId.split('_')[0];
    this.recordHistogram(`${name}_duration_ms`, duration, labels);

    return duration;
  }

  // Record Norwegian compliance metrics
  recordComplianceMetric(
    type: 'NSM' | 'GDPR' | 'DIGDIR',
    operation: string,
    success: boolean,
    labels?: Record<string, string>
  ): void {
    if (!this.options.enableCompliance) return;

    const complianceLabels = {
      ...this.options.defaultLabels,
      ...labels,
      compliance_type: type,
      operation,
      success: success.toString(),
    };

    this.incrementCounter('compliance_operations_total', 1, complianceLabels);

    if (!success) {
      this.incrementCounter('compliance_errors_total', 1, complianceLabels);
    }
  }

  // Record NSM security event metrics
  recordNSMSecurityMetric(
    classification: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG',
    eventType: string,
    labels?: Record<string, string>
  ): void {
    const securityLabels = {
      ...this.options.defaultLabels,
      ...labels,
      nsm_classification: classification,
      event_type: eventType,
    };

    this.incrementCounter('nsm_security_events_total', 1, securityLabels);
  }

  // Record GDPR data processing metrics
  recordGDPRMetric(
    operation: 'access' | 'update' | 'delete' | 'export',
    dataType: string,
    personalDataIncluded: boolean,
    labels?: Record<string, string>
  ): void {
    const gdprLabels = {
      ...this.options.defaultLabels,
      ...labels,
      gdpr_operation: operation,
      data_type: dataType,
      personal_data: personalDataIncluded.toString(),
    };

    this.incrementCounter('gdpr_operations_total', 1, gdprLabels);

    if (personalDataIncluded) {
      this.incrementCounter('gdpr_personal_data_operations_total', 1, gdprLabels);
    }
  }

  // Record application performance metrics
  recordPerformanceMetric(
    metricType: 'response_time' | 'throughput' | 'error_rate',
    value: number,
    service: string,
    labels?: Record<string, string>
  ): void {
    const perfLabels = {
      ...this.options.defaultLabels,
      ...labels,
      service,
      metric_type: metricType,
    };

    switch (metricType) {
      case 'response_time':
        this.recordHistogram('http_request_duration_ms', value, perfLabels);
        break;
      case 'throughput':
        this.setGauge('requests_per_second', value, perfLabels);
        break;
      case 'error_rate':
        this.setGauge('error_rate_percent', value, perfLabels);
        break;
    }
  }

  // Create metric key with labels
  private createKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    return `${name}{${labelString}}`;
  }

  // Record metric value
  private recordMetric(metric: MetricValue): void {
    this.metrics.push(metric);

    // Trim metrics if exceeding max
    const maxMetrics = this.options.maxMetrics;
    if (maxMetrics && this.metrics.length > maxMetrics) {
      this.metrics = this.metrics.slice(-maxMetrics);
    }
  }

  // Create new histogram
  private createHistogram(): Histogram {
    const buckets: HistogramBucket[] = [
      { le: 1, count: 0 },
      { le: 5, count: 0 },
      { le: 10, count: 0 },
      { le: 25, count: 0 },
      { le: 50, count: 0 },
      { le: 100, count: 0 },
      { le: 250, count: 0 },
      { le: 500, count: 0 },
      { le: 1000, count: 0 },
      { le: Infinity, count: 0 },
    ];

    return { buckets, sum: 0, count: 0 };
  }

  // Update histogram with new value
  private updateHistogram(histogram: Histogram, value: number): void {
    histogram.sum += value;
    histogram.count++;

    for (const bucket of histogram.buckets) {
      if (value <= bucket.le) {
        bucket.count++;
      }
    }
  }

  // Serialize histogram for storage
  private serializeHistogram(histogram: Histogram): any {
    return {
      buckets: histogram.buckets.map(b => ({ le: b.le, count: b.count })),
      sum: histogram.sum,
      count: histogram.count,
    };
  }

  // Start auto-flush timer
  private startAutoFlush(): void {
    const flushInterval = this.options.flushInterval;
    if (!flushInterval) return;

    this.flushTimer = setInterval(() => {
      // Only flush if we're not in test environment or if tests are still running
      if (process.env.NODE_ENV !== 'test' || !process.env.JEST_WORKER_ID) {
        this.flush();
      }
    }, flushInterval);

    // Unref the timer so it doesn't keep the process alive
    if (this.flushTimer && typeof this.flushTimer.unref === 'function') {
      this.flushTimer.unref();
    }
  }

  // Flush metrics (in real implementation, send to monitoring system)
  flush(): MetricValue[] {
    const metricsToFlush = [...this.metrics];

    // Only log if we're not in test environment or if Jest is still running
    if (process.env.NODE_ENV !== 'test' || typeof jest === 'undefined') {
      // In real implementation, send to Prometheus, DataDog, etc.
      // eslint-disable-next-line no-console
      console.log('METRICS_FLUSH:', {
        timestamp: new Date(),
        count: metricsToFlush.length,
        counters: Object.fromEntries(this.counters),
        gauges: Object.fromEntries(this.gauges),
        histograms: Object.fromEntries(
          Array.from(this.histograms.entries()).map(([key, hist]) => [
            key,
            this.serializeHistogram(hist),
          ])
        ),
      });
    }

    // Clear flushed metrics
    this.metrics = [];

    return metricsToFlush;
  }

  // Get current metrics summary
  getMetricsSummary() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([key, hist]) => [
          key,
          {
            count: hist.count,
            sum: hist.sum,
            avg: hist.count > 0 ? hist.sum / hist.count : 0,
          },
        ])
      ),
      totalMetrics: this.metrics.length,
      activeTimers: this.timers.size,
    };
  }

  // Get metrics statistics
  getStats() {
    const now = new Date();
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => m.timestamp >= last5Minutes);

    return {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      counters: this.counters.size,
      gauges: this.gauges.size,
      histograms: this.histograms.size,
      activeTimers: this.timers.size,
      complianceEnabled: this.options.enableCompliance,
      histogramsEnabled: this.options.enableHistograms,
    };
  }

  // Stop auto-flush
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  // Clear all metrics
  clear(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
    this.metrics = [];
  }
}

// Default metrics collector
let defaultCollector: MetricsCollector;

export const getMetricsCollector = (): MetricsCollector => {
  if (!defaultCollector) {
    defaultCollector = new MetricsCollector();
  }
  return defaultCollector;
};

export const createMetricsCollector = (options?: MetricsOptions): MetricsCollector => {
  return new MetricsCollector(options);
};

// Convenience functions
export const incrementCounter = (
  name: string,
  value?: number,
  labels?: Record<string, string>
): void => {
  getMetricsCollector().incrementCounter(name, value, labels);
};

export const setGauge = (name: string, value: number, labels?: Record<string, string>): void => {
  getMetricsCollector().setGauge(name, value, labels);
};

export const recordHistogram = (
  name: string,
  value: number,
  labels?: Record<string, string>
): void => {
  getMetricsCollector().recordHistogram(name, value, labels);
};

export const startTimer = (name: string): string => {
  return getMetricsCollector().startTimer(name);
};

export const endTimer = (timerId: string, labels?: Record<string, string>): number => {
  return getMetricsCollector().endTimer(timerId, labels);
};
