import { Router } from 'express';
import { z } from 'zod';
import { ActivatePrivacyModeUseCase } from '../../../application/use-cases/privacy/ActivatePrivacyModeUseCase';
import { DeactivatePrivacyModeUseCase } from '../../../application/use-cases/privacy/DeactivatePrivacyModeUseCase';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';

const activateSchema = z.object({
  body: z.object({
    circleId: z.string().uuid(),
    durationMinutes: z.number().int().min(15).max(480),
  }),
});

const deactivateSchema = z.object({
  body: z.object({
    circleId: z.string().uuid(),
  }),
});

export function createPrivacyRoutes(
  activateUseCase: ActivatePrivacyModeUseCase,
  deactivateUseCase: DeactivatePrivacyModeUseCase,
): Router {
  const router = Router();

  router.post('/activate', validate(activateSchema), asyncHandler(async (req, res) => {
    const result = await activateUseCase.execute({
      userId: req.user!.userId,
      circleId: req.body.circleId,
      durationMinutes: req.body.durationMinutes,
    });
    res.json(result);
  }));

  router.post('/deactivate', validate(deactivateSchema), asyncHandler(async (req, res) => {
    await deactivateUseCase.execute({
      userId: req.user!.userId,
      circleId: req.body.circleId,
    });
    res.status(204).send();
  }));

  return router;
}
