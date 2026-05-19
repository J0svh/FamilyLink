import { logger } from '../../shared/logger';

interface AlertConfig {
  windowMs: number;
  thresholdPercent: number;
  discordWebhookUrl?: string;
}

export class ErrorAlertService {
  private errorCount = 0;
  private requestCount = 0;
  private lastReset: Date = new Date();
  private config: AlertConfig;
  private alertSent = false;

  constructor(config?: Partial<AlertConfig>) {
    this.config = {
      windowMs: 5 * 60 * 1000, // 5 minutes
      thresholdPercent: 1, // 1% of requests
      discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
      ...config,
    };

    // Reset window periodically
    setInterval(() => this.resetWindow(), this.config.windowMs);
  }

  trackRequest(): void {
    this.requestCount++;
  }

  trackError(): void {
    this.errorCount++;
    this.checkThreshold();
  }

  private checkThreshold(): void {
    if (this.requestCount === 0) return;

    const errorRate = (this.errorCount / this.requestCount) * 100;

    if (errorRate > this.config.thresholdPercent && !this.alertSent) {
      this.sendAlert(errorRate);
      this.alertSent = true;
    }
  }

  private async sendAlert(errorRate: number): Promise<void> {
    const message = `⚠️ **FamilyLink Alert**: Error rate ${errorRate.toFixed(2)}% exceeds threshold (${this.config.thresholdPercent}%) in the last 5 minutes. Errors: ${this.errorCount}/${this.requestCount} requests.`;

    logger.warn({ errorRate, errorCount: this.errorCount, requestCount: this.requestCount }, 'Error rate threshold exceeded');

    if (this.config.discordWebhookUrl) {
      try {
        await fetch(this.config.discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message }),
        });
      } catch (error) {
        logger.error({ error }, 'Failed to send Discord alert');
      }
    }
  }

  private resetWindow(): void {
    this.errorCount = 0;
    this.requestCount = 0;
    this.alertSent = false;
    this.lastReset = new Date();
  }

  getStatus(): { errorCount: number; requestCount: number; errorRate: number; windowStart: Date } {
    return {
      errorCount: this.errorCount,
      requestCount: this.requestCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      windowStart: this.lastReset,
    };
  }
}

export const errorAlertService = new ErrorAlertService();
