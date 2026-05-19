import { Router } from 'express';
import { z } from 'zod';
import { SendMessageUseCase } from '../../../application/use-cases/chat/SendMessageUseCase';
import { GetMessagesUseCase } from '../../../application/use-cases/chat/GetMessagesUseCase';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';

const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(2000),
    type: z.enum(['text', 'emoji', 'image']).optional(),
  }),
  params: z.object({
    circleId: z.string().uuid(),
  }),
});

const getMessagesSchema = z.object({
  params: z.object({
    circleId: z.string().uuid(),
  }),
});

export function createChatRoutes(
  sendMessageUseCase: SendMessageUseCase,
  getMessagesUseCase: GetMessagesUseCase,
): Router {
  const router = Router();

  // Send message
  router.post('/circles/:circleId/messages', validate(sendMessageSchema), asyncHandler(async (req, res) => {
    const result = await sendMessageUseCase.execute({
      circleId: req.params.circleId,
      userId: req.user!.userId,
      content: req.body.content,
      type: req.body.type,
    });
    res.status(201).json(result);
  }));

  // Get messages
  router.get('/circles/:circleId/messages', validate(getMessagesSchema), asyncHandler(async (req, res) => {
    const result = await getMessagesUseCase.execute({
      circleId: req.params.circleId,
      userId: req.user!.userId,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      before: req.query.before as string | undefined,
    });
    res.json(result);
  }));

  return router;
}
