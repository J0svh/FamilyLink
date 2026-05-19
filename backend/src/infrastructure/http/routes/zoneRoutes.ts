import { Router } from 'express';
import { z } from 'zod';
import { CreateZoneUseCase } from '../../../application/use-cases/zone/CreateZoneUseCase';
import { UpdateZoneUseCase } from '../../../application/use-cases/zone/UpdateZoneUseCase';
import { DeleteZoneUseCase } from '../../../application/use-cases/zone/DeleteZoneUseCase';
import { GetZonesByCircleUseCase } from '../../../application/use-cases/zone/GetZonesByCircleUseCase';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';

const vertexSchema = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

const createZoneSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    nameEn: z.string().max(100).optional(),
    colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    vertices: z.array(vertexSchema).min(3).max(50),
  }),
  params: z.object({
    circleId: z.string().uuid(),
  }),
});

const updateZoneSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    nameEn: z.string().max(100).optional(),
    colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    vertices: z.array(vertexSchema).min(3).max(50).optional(),
  }),
  params: z.object({
    circleId: z.string().uuid(),
    zoneId: z.string().uuid(),
  }),
});

const deleteZoneSchema = z.object({
  params: z.object({
    circleId: z.string().uuid(),
    zoneId: z.string().uuid(),
  }),
});

const getZonesSchema = z.object({
  params: z.object({
    circleId: z.string().uuid(),
  }),
});

export function createZoneRoutes(
  createZoneUseCase: CreateZoneUseCase,
  updateZoneUseCase: UpdateZoneUseCase,
  deleteZoneUseCase: DeleteZoneUseCase,
  getZonesByCircleUseCase: GetZonesByCircleUseCase,
): Router {
  const router = Router();

  router.post('/circles/:circleId', validate(createZoneSchema), asyncHandler(async (req, res) => {
    const result = await createZoneUseCase.execute({
      circleId: req.params.circleId,
      userId: req.user!.userId,
      name: req.body.name,
      nameEn: req.body.nameEn,
      colorHex: req.body.colorHex,
      vertices: req.body.vertices,
    });
    res.status(201).json(result);
  }));

  router.patch('/circles/:circleId/:zoneId', validate(updateZoneSchema), asyncHandler(async (req, res) => {
    const result = await updateZoneUseCase.execute({
      zoneId: req.params.zoneId,
      circleId: req.params.circleId,
      userId: req.user!.userId,
      name: req.body.name,
      nameEn: req.body.nameEn,
      colorHex: req.body.colorHex,
      vertices: req.body.vertices,
    });
    res.json(result);
  }));

  router.delete('/circles/:circleId/:zoneId', validate(deleteZoneSchema), asyncHandler(async (req, res) => {
    await deleteZoneUseCase.execute({
      zoneId: req.params.zoneId,
      circleId: req.params.circleId,
      userId: req.user!.userId,
    });
    res.status(204).send();
  }));

  router.get('/circles/:circleId', validate(getZonesSchema), asyncHandler(async (req, res) => {
    const result = await getZonesByCircleUseCase.execute({
      circleId: req.params.circleId,
      userId: req.user!.userId,
    });
    res.json(result);
  }));

  return router;
}
