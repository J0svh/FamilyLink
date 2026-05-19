import { Router } from 'express';
import { z } from 'zod';
import { ShareLocationUseCase } from '../../../application/use-cases/location/ShareLocationUseCase';
import { GetCircleLocationsUseCase } from '../../../application/use-cases/location/GetCircleLocationsUseCase';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { locationRateLimit } from '../middleware/rateLimitMiddleware';

const shareLocationSchema = z.object({
  body: z.object({
    circleId: z.string().uuid(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

const getLocationsSchema = z.object({
  params: z.object({
    circleId: z.string().uuid(),
  }),
});

export function createLocationRoutes(
  shareLocationUseCase: ShareLocationUseCase,
  getCircleLocationsUseCase: GetCircleLocationsUseCase,
): Router {
  const router = Router();

  router.post('/', locationRateLimit, validate(shareLocationSchema), asyncHandler(async (req, res) => {
    const result = await shareLocationUseCase.execute({
      userId: req.user!.userId,
      circleId: req.body.circleId,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });
    res.status(201).json(result);
  }));

  router.get('/circles/:circleId', validate(getLocationsSchema), asyncHandler(async (req, res) => {
    const result = await getCircleLocationsUseCase.execute({
      circleId: req.params.circleId,
      requestingUserId: req.user!.userId,
    });
    res.json(result);
  }));

  return router;
}
