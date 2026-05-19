import { IRefreshTokenRepository } from '../../../domain/ports/IRefreshTokenRepository';
import { LogoutInputDTO } from '../../dtos/auth/LogoutDTO';
import { AppError } from '../../../shared/AppError';

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(dto: LogoutInputDTO): Promise<void> {
    if (!dto.refreshToken) {
      throw AppError.badRequest('Refresh token is required');
    }

    // Revoke the refresh token
    await this.refreshTokenRepo.revoke(dto.refreshToken);
  }
}
