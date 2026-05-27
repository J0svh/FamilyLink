import { ICircleRepository } from '../../../domain/ports/ICircleRepository';
import { CircleId } from '../../../domain/value-objects/CircleId';
import { UserId } from '../../../domain/value-objects/UserId';
import { AppError } from '../../../shared/AppError';
import { prisma } from '../../../infrastructure/persistence/PrismaClient';

export interface GetMessagesInputDTO {
  circleId: string;
  userId: string;
  limit?: number;
  before?: string;
}

export interface MessageDTO {
  messageId: string;
  userId: string;
  username: string;
  content: string;
  type: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface GetMessagesOutputDTO {
  messages: MessageDTO[];
  hasMore: boolean;
}

export class GetMessagesUseCase {
  constructor(
    private readonly circleRepo: ICircleRepository,
  ) {}

  async execute(dto: GetMessagesInputDTO): Promise<GetMessagesOutputDTO> {
    const circleId = CircleId.create(dto.circleId);
    const userId = UserId.create(dto.userId);

    const circle = await this.circleRepo.findById(circleId);
    if (!circle) throw AppError.notFound('Circle not found');
    if (!circle.isMember(userId)) throw AppError.forbidden('Not a member of this circle');

    const limit = dto.limit || 50;

    const messages = await prisma.message.findMany({
      where: {
        circleId: dto.circleId,
        ...(dto.before ? { createdAt: { lt: new Date(dto.before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: { sender: { select: { username: true } } },
    });

    const hasMore = messages.length > limit;
    const result = messages.slice(0, limit).reverse();

    return {
      messages: result.map(m => ({
        messageId: m.id,
        userId: m.senderId,
        username: m.sender.username || "Usuario",
        content: m.content,
        type: m.type,
        attachmentUrl: m.attachmentUrl,
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore,
    };
  }
}
