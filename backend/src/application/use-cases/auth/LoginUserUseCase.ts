import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/ports/IRefreshTokenRepository';
import { ITokenService } from '../../../domain/ports/ITokenService';
import { IPasswordHasher } from '../../../domain/ports/IPasswordHasher';
import { Email } from '../../../domain/value-objects/Email';
import { LoginInputDTO, LoginOutputDTO } from '../../dtos/auth/LoginDTO';
import { AppError } from '../../../shared/AppError';

export class LoginUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: LoginInputDTO): Promise<LoginOutputDTO> {
    // Validate email format
    const email = Email.create(dto.email);

    // Find user by email
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.getPasswordHash());
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload = { userId: user.getId().getValue(), email: email.getValue() };
    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    // Persist refresh token
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.save(user.getId(), refreshToken, refreshExpiresAt);

    return {
      userId: user.getId().getValue(),
      email: email.getValue(),
      username: user.getUsername(),
      accessToken,
      refreshToken,
    };
  }
}
