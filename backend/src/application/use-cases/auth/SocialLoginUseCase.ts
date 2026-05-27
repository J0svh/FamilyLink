import { prisma } from '../../../infrastructure/persistence/PrismaClient';
import { PrismaSocialAccountRepository } from '../../../infrastructure/persistence/PrismaSocialAccountRepository';
import { JwtTokenService } from '../../../infrastructure/auth/JwtTokenService';

export interface SocialLoginInput {
  provider: 'google';
  providerId: string;
  email: string;
  displayName: string;
}

export interface SocialLoginResult {
  accessToken: string;
  refreshToken: string;
  needsUsername: boolean;
  userId: string;
  email: string;
  username: string | null;
}

export class SocialLoginUseCase {
  constructor(
    private socialAccountRepo: PrismaSocialAccountRepository,
    private tokenService: JwtTokenService,
  ) {}

  async execute(input: SocialLoginInput): Promise<SocialLoginResult> {
    // 1. Check if social account already exists
    const existingSocial = await this.socialAccountRepo.findByProviderAndProviderId(
      input.provider,
      input.providerId,
    );

    if (existingSocial) {
      const user = await prisma.user.findUnique({ where: { id: existingSocial.userId } });
      if (!user) throw new Error('User not found for social account');
      return this.issueTokens(user);
    }

    // 2. Check if user with this email exists (link account)
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

    if (existingUser) {
      await this.socialAccountRepo.create({
        userId: existingUser.id,
        provider: input.provider,
        providerId: input.providerId,
      });
      return this.issueTokens(existingUser);
    }

    // 3. Create new user (no password, maybe no username)
    const newUser = await prisma.user.create({
      data: {
        email: input.email,
        username: input.displayName.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20) || null,
        passwordHash: null,
        language: 'es',
      },
    });

    await this.socialAccountRepo.create({
      userId: newUser.id,
      provider: input.provider,
      providerId: input.providerId,
    });

    return this.issueTokens(newUser);
  }

  private issueTokens(user: any): SocialLoginResult {
    const needsUsername = !user.username;

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = this.tokenService.generateRefreshToken({ userId: user.id, email: user.email });

    return {
      accessToken,
      refreshToken,
      needsUsername,
      userId: user.id,
      email: user.email,
      username: user.username || null,
    };
  }
}
