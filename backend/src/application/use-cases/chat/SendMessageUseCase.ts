import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { AppError } from '../../../shared/AppError';
import { prisma } from '../../../infrastructure/persistence/PrismaClient';

export interface SendMessageInputDTO {
  circleId: string;
  userId: string;
  content: string;
  type?: 'text' | 'emoji' | 'image' | 'gif' | 'photo' | 'voice';
  attachmentUrl?: string;
}

export interface SendMessageOutputDTO {
  messageId: string;
  circleId: string;
  userId: string;
  username: string;
  content: string;
  type: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export class SendMessageUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
  ) {}

  async execute(dto: SendMessageInputDTO): Promise<SendMessageOutputDTO> {
    const circleId = CircleId.create(dto.circleId);
    const userId = UserId.create(dto.userId);

    const circle = await this.circleRepo.findById(circleId);
    if (!circle) throw AppError.notFound('Circle not found');
    if (!circle.isMember(userId)) throw AppError.forbidden('Not a member of this circle');

    if (!dto.content || dto.content.trim().length === 0) {
      throw AppError.badRequest('Message content is required');
    }
    // Only enforce length limit for text messages (images/voice are base64)
    const isMediaType = ['image', 'gif', 'photo', 'voice'].includes(dto.type || '');
    if (!isMediaType && dto.content.length > 2000) {
      throw AppError.badRequest('Message too long (max 2000 characters)');
    }

    const user = await prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw AppError.notFound('User not found');

    const message = await prisma.message.create({
      data: {
        circleId: dto.circleId,
        senderId: dto.userId,
        content: dto.content.trim(),
        type: dto.type || 'text',
        attachmentUrl: dto.attachmentUrl || null,
      },
    });

    return {
      messageId: message.id,
      circleId: message.circleId,
      userId: message.senderId,
      username: user.username,
      content: message.content,
      type: message.type,
      attachmentUrl: message.attachmentUrl,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
