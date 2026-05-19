import { logger } from '../../shared/logger';

export interface AuditEntry {
  action: string;
  userId: string;
  circleId?: string;
  zoneId?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export class AuditLogger {
  logZoneOperation(entry: AuditEntry): void {
    logger.info({
      type: 'audit',
      action: entry.action,
      userId: entry.userId,
      circleId: entry.circleId,
      zoneId: entry.zoneId,
      details: entry.details,
      timestamp: entry.timestamp.toISOString(),
    }, `Audit: ${entry.action}`);
  }

  logAuthEvent(action: string, userId: string, details?: Record<string, unknown>): void {
    logger.info({
      type: 'audit',
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
    }, `Auth: ${action}`);
  }

  logPrivacyEvent(action: string, userId: string, circleId: string): void {
    logger.info({
      type: 'audit',
      action,
      userId,
      circleId,
      timestamp: new Date().toISOString(),
    }, `Privacy: ${action}`);
  }
}

export const auditLogger = new AuditLogger();
