import { ILocationRepository } from '../../domain/ports/ILocationRepository';
import { IInvitationRepository } from '../../domain/ports/IInvitationRepository';
import { logger } from '../../shared/logger';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

export function startCronJobs(
  locationRepo: ILocationRepository,
  invitationRepo: IInvitationRepository,
): void {
  // Purge location updates older than 30 days — runs every 24 hours
  setInterval(async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * ONE_DAY);
      await locationRepo.deleteOlderThan(thirtyDaysAgo);
      logger.info('Cron: Purged location updates older than 30 days');
    } catch (error) {
      logger.error({ error }, 'Cron: Failed to purge old location updates');
    }
  }, ONE_DAY);

  // Log that cron jobs are started
  logger.info('Cron jobs started: location purge (daily)');
}
