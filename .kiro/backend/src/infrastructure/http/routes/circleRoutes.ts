import { Router } from 'express';
import { z } from 'zod';
import { CreateCircleUseCase } from '../../../application/use-cases/circle/CreateCircleUseCase';
import { InviteMemberUseCase } from '../../../application/use-cases/circle/InviteMemberUseCase';
import { AcceptInvitationUseCase } from '../../../application/use-cases/circle/AcceptInvitationUseCase';
import { DissolveCircleUseCase } from '../../../application/use-cases/circle/DissolveCircleUseCase';
import { RemoveMemberUseCase } from '../../../application/use-cases/circle/RemoveMemberUseCase';
import { UpdateMemberRoleUseCase } from '../../../application/use-cases/circle/UpdateMemberRoleUseCase';
import { UpdateDailyLimitsUseCase } from '../../../application/use-cases/circle/UpdateDailyLimitsUseCase';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';

const createCircleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
  }),
});

const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  params: z.object({
    circleId: z.string().uuid(),
  }),
});

const acceptInvitationSchema = z.object({
  params: z.object({
    invitationId: z.string().uuid(),
  }),
});

const removeMemberSchema = z.object({
  params: z.object({
    circleId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(['CIRCLE_ADMIN', 'CIRCLE_MEMBER']),
  }),
  params: z.object({
    circleId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

const updateDailyLimitsSchema = z.object({
  body: z.object({
    limit: z.number().int().min(1).max(500),
  }),
  params: z.object({
    circleId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

export function createCircleRoutes(
  createCircleUseCase: CreateCircleUseCase,
  inviteMemberUseCase: InviteMemberUseCase,
  acceptInvitationUseCase: AcceptInvitationUseCase,
  dissolveCircleUseCase: DissolveCircleUseCase,
  removeMemberUseCase: RemoveMemberUseCase,
  updateMemberRoleUseCase: UpdateMemberRoleUseCase,
  updateDailyLimitsUseCase: UpdateDailyLimitsUseCase,
): Router {
  const router = Router();

  router.post('/', validate(createCircleSchema), asyncHandler(async (req, res) => {
    const result = await createCircleUseCase.execute({
      name: req.body.name,
      userId: req.user!.userId,
    });
    res.status(201).json(result);
  }));

  router.post('/:circleId/invitations', validate(inviteMemberSchema), asyncHandler(async (req, res) => {
    const result = await inviteMemberUseCase.execute({
      circleId: req.params.circleId,
      invitedByUserId: req.user!.userId,
      email: req.body.email,
    });
    res.status(201).json(result);
  }));

  router.post('/invitations/:invitationId/accept', validate(acceptInvitationSchema), asyncHandler(async (req, res) => {
    const result = await acceptInvitationUseCase.execute({
      invitationId: req.params.invitationId,
      userId: req.user!.userId,
    });
    res.json(result);
  }));

  router.delete('/:circleId', asyncHandler(async (req, res) => {
    await dissolveCircleUseCase.execute({
      circleId: req.params.circleId,
      userId: req.user!.userId,
    });
    res.status(204).send();
  }));

  router.delete('/:circleId/members/:userId', validate(removeMemberSchema), asyncHandler(async (req, res) => {
    await removeMemberUseCase.execute({
      circleId: req.params.circleId,
      requestingUserId: req.user!.userId,
      targetUserId: req.params.userId,
    });
    res.status(204).send();
  }));

  router.patch('/:circleId/members/:userId/role', validate(updateRoleSchema), asyncHandler(async (req, res) => {
    await updateMemberRoleUseCase.execute({
      circleId: req.params.circleId,
      requestingUserId: req.user!.userId,
      targetUserId: req.params.userId,
      newRole: req.body.role,
    });
    res.status(204).send();
  }));

  router.put('/:circleId/members/:userId/daily-limit', validate(updateDailyLimitsSchema), asyncHandler(async (req, res) => {
    await updateDailyLimitsUseCase.execute({
      circleId: req.params.circleId,
      requestingUserId: req.user!.userId,
      targetUserId: req.params.userId,
      limit: req.body.limit,
    });
    res.status(204).send();
  }));

  return router;
}
