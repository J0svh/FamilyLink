import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/ports/IRefreshTokenRepository';
import { ITokenService } from '../../../domain/ports/ITokenService';
import { IPasswordHasher } from '../../../domain/ports/IPasswordHasher';
import { User } from '../../../domain/aggregates/user/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { RegisterInputDTO, RegisterOutputDTO } from '../../dtos/auth/RegisterDTO';
import { AppError } from '../../../shared/AppError';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: RegisterInputDTO): Promise<RegisterOutputDTO> {
    // Validate email format
    const email = Email.create(dto.email);

    // Check if email already exists
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw AppError.conflict('Email already registered');
    }

    // Validate password strength
    if (!dto.password || dto.password.length < 8) {
      throw AppError.badRequest('Password must be at least 8 characters');
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // Create user
    const userId = UserId.create();
    const user = User.create({
      id: userId,
      email,
      username: dto.username,
      passwordHash,
      language: dto.language,
    });

    // Persist user
    await this.userRepo.save(user);

    // Generate tokens
    const tokenPayload = { userId: userId.getValue(), email: email.getValue() };
    const accessToken = this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

    // Persist refresh token (expires in 7 days)
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.save(userId, refreshToken, refreshExpiresAt);

    return {
      userId: userId.getValue(),
      email: email.getValue(),
      username: dto.username,
      accessToken,
      refreshToken,
    };
  }
}
