import { prisma } from './PrismaClient';

export interface SocialAccountRecord {
  id: string;
  userId: string;
  provider: string;
  providerId: string;
  createdAt: Date;
}

export class PrismaSocialAccountRepository {
  async findByProviderAndProviderId(provider: string, providerId: string): Promise<SocialAccountRecord | null> {
    return prisma.socialAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
    });
  }

  async findByUserId(userId: string): Promise<SocialAccountRecord[]> {
    return prisma.socialAccount.findMany({ where: { userId } });
  }

  async create(input: { userId: string; provider: string; providerId: string }): Promise<SocialAccountRecord> {
    return prisma.socialAccount.create({ data: input });
  }

  async deleteByUserAndProvider(userId: string, provider: string): Promise<void> {
    await prisma.socialAccount.deleteMany({ where: { userId, provider } });
  }
}
