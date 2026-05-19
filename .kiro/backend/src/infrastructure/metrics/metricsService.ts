interface MetricCounter {
  name: string;
  help: string;
  labels: Record<string, string>;
  value: number;
}

interface MetricGauge {
  name: string;
  help: string;
  value: number;
}

export class MetricsService {
  private counters: Map<string, MetricCounter> = new Map();
  private gauges: Map<string, MetricGauge> = new Map();

  incrementCounter(name: string, labels: Record<string, string> = {}, help = ''): void {
    const key = `${name}:${JSON.stringify(labels)}`;
    const existing = this.counters.get(key);
    if (existing) {
      existing.value++;
    } else {
      this.counters.set(key, { name, help, labels, value: 1 });
    }
  }

  setGauge(name: string, value: number, help = ''): void {
    this.gauges.set(name, { name, help, value });
  }

  // Track location updates per circle
  trackLocationUpdate(circleId: string): void {
    this.incrementCounter(
      'familylink_location_updates_total',
      { circle_id: circleId },
      'Total number of location updates',
    );
  }

  // Track HTTP requests
  trackHttpRequest(method: string, path: string, statusCode: number): void {
    this.incrementCounter(
      'familylink_http_requests_total',
      { method, path, status: String(statusCode) },
      'Total HTTP requests',
    );
  }

  // Track errors
  trackError(type: string): void {
    this.incrementCounter(
      'familylink_errors_total',
      { type },
      'Total errors by type',
    );
  }

  // Get Prometheus-format output
  getMetrics(): string {
    const lines: string[] = [];

    // Counters
    const countersByName = new Map<string, MetricCounter[]>();
    for (const counter of this.counters.values()) {
      const existing = countersByName.get(counter.name) || [];
      existing.push(counter);
      countersByName.set(counter.name, existing);
    }

    for (const [name, counters] of countersByName) {
      if (counters[0]?.help) {
        lines.push(`# HELP ${name} ${counters[0].help}`);
      }
      lines.push(`# TYPE ${name} counter`);
      for (const counter of counters) {
        const labelStr = Object.entries(counter.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',');
        lines.push(`${name}{${labelStr}} ${counter.value}`);
      }
    }

    // Gauges
    for (const gauge of this.gauges.values()) {
      if (gauge.help) {
        lines.push(`# HELP ${gauge.name} ${gauge.help}`);
      }
      lines.push(`# TYPE ${gauge.name} gauge`);
      lines.push(`${gauge.name} ${gauge.value}`);
    }

    return lines.join('\n');
  }

  // Reset all metrics (for testing)
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
  }
}

export const metricsService = new MetricsService();
