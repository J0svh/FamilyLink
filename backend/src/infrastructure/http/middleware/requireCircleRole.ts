import { Request, Response, NextFunction } from 'express';
import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { CircleRole } from '../../../domain/aggregates/circle/CircleRole';
import { AppError } from '../../../shared/AppError';

export function createRequireCircleRole(circleRepo: ICircleRepository, requiredRole?: CircleRole) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    const circleId = req.params.circleId || req.body.circleId;

    if (!userId) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!circleId) {
      throw AppError.badRequest('Circle ID is required');
    }

    const circle = await circleRepo.findById(CircleId.create(circleId));
    if (!circle) {
      throw AppError.notFound('Circle not found');
    }

    const userIdVO = UserId.create(userId);
    if (!circle.isMember(userIdVO)) {
      throw AppError.forbidden('User is not a member of this circle');
    }

    if (requiredRole === CircleRole.CIRCLE_ADMIN && !circle.isAdmin(userIdVO)) {
      throw AppError.forbidden('Admin role required');
    }

    next();
  };
}
