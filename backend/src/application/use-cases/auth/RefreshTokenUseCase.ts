import { IRefreshTokenRepository } from '../../../domain/ports/IRefreshTokenRepository';
import { ITokenService } from '../../../domain/ports/ITokenService';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { RefreshTokenInputDTO, RefreshTokenOutputDTO } from '../../dtos/auth/RefreshTokenDTO';
import { AppError } from '../../../shared/AppError';

export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: RefreshTokenInputDTO): Promise<RefreshTokenOutputDTO> {
    // Verify the refresh token signature
    let payload;
    try {
      payload = this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    // Check if token exists in DB and is not revoked
    const storedToken = await this.refreshTokenRepo.findByToken(dto.refreshToken);
    if (!storedToken) {
      throw AppError.unauthorized('Refresh token not found');
    }
    if (storedToken.revokedAt) {
      // Token reuse detected - revoke all tokens for this user
      await this.refreshTokenRepo.revokeAllByUserId(UserId.create(storedToken.userId));
      throw AppError.unauthorized('Refresh token has been revoked (possible token theft)');
    }
    if (new Date() > storedToken.expiresAt) {
      throw AppError.unauthorized('Refresh token has expired');
    }

    // Revoke old refresh token (rotation)
    await this.refreshTokenRepo.revoke(dto.refreshToken);

    // Generate new tokens
    const newAccessToken = this.tokenService.generateAccessToken(payload);
    const newRefreshToken = this.tokenService.generateRefreshToken(payload);

    // Persist new refresh token
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.save(UserId.create(payload.userId), newRefreshToken, refreshExpiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
