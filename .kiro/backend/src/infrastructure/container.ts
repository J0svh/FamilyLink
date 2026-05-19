import { Server as SocketIOServer } from 'socket.io';

// Persistence
import { PostgresUserRepository } from './persistence/PostgresUserRepository';
import { PostgresCircleRepository } from './persistence/PostgresCircleRepository';
import { PostgresZoneRepository } from './persistence/PostgresZoneRepository';
import { PostgresLocationRepository } from './persistence/PostgresLocationRepository';
import { PostgresInvitationRepository } from './persistence/PostgresInvitationRepository';
import { PostgresRefreshTokenRepository } from './persistence/PostgresRefreshTokenRepository';

// Auth
import { JwtTokenService } from './auth/JwtTokenService';
import { BcryptPasswordHasher } from './auth/BcryptPasswordHasher';

// Cache
import { UpstashLocationCache } from './cache/UpstashLocationCache';

// Notifications
import { FCMNotificationAdapter } from './notifications/FCMNotificationAdapter';

// Realtime
import { SocketIOEventPublisher } from './realtime/SocketIOEventPublisher';

// Use Cases - Auth
import { RegisterUserUseCase } from '../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../application/use-cases/auth/LogoutUseCase';

// Use Cases - Circle
import { CreateCircleUseCase } from '../application/use-cases/circle/CreateCircleUseCase';
import { InviteMemberUseCase } from '../application/use-cases/circle/InviteMemberUseCase';
import { AcceptInvitationUseCase } from '../application/use-cases/circle/AcceptInvitationUseCase';
import { DissolveCircleUseCase } from '../application/use-cases/circle/DissolveCircleUseCase';
import { RemoveMemberUseCase } from '../application/use-cases/circle/RemoveMemberUseCase';
import { UpdateMemberRoleUseCase } from '../application/use-cases/circle/UpdateMemberRoleUseCase';
import { UpdateDailyLimitsUseCase } from '../application/use-cases/circle/UpdateDailyLimitsUseCase';

// Use Cases - Location
import { ShareLocationUseCase } from '../application/use-cases/location/ShareLocationUseCase';
import { GetCircleLocationsUseCase } from '../application/use-cases/location/GetCircleLocationsUseCase';

// Use Cases - Zone
import { CreateZoneUseCase } from '../application/use-cases/zone/CreateZoneUseCase';
import { UpdateZoneUseCase } from '../application/use-cases/zone/UpdateZoneUseCase';
import { DeleteZoneUseCase } from '../application/use-cases/zone/DeleteZoneUseCase';
import { GetZonesByCircleUseCase } from '../application/use-cases/zone/GetZonesByCircleUseCase';

// Use Cases - Privacy
import { ActivatePrivacyModeUseCase } from '../application/use-cases/privacy/ActivatePrivacyModeUseCase';
import { DeactivatePrivacyModeUseCase } from '../application/use-cases/privacy/DeactivatePrivacyModeUseCase';

export interface Container {
  // Repositories
  userRepo: PostgresUserRepository;
  circleRepo: PostgresCircleRepository;
  zoneRepo: PostgresZoneRepository;
  locationRepo: PostgresLocationRepository;
  invitationRepo: PostgresInvitationRepository;
  refreshTokenRepo: PostgresRefreshTokenRepository;

  // Services
  tokenService: JwtTokenService;
  passwordHasher: BcryptPasswordHasher;
  locationCache: UpstashLocationCache;
  notificationService: FCMNotificationAdapter;
  eventPublisher: SocketIOEventPublisher;

  // Use Cases - Auth
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  logoutUseCase: LogoutUseCase;

  // Use Cases - Circle
  createCircleUseCase: CreateCircleUseCase;
  inviteMemberUseCase: InviteMemberUseCase;
  acceptInvitationUseCase: AcceptInvitationUseCase;
  dissolveCircleUseCase: DissolveCircleUseCase;
  removeMemberUseCase: RemoveMemberUseCase;
  updateMemberRoleUseCase: UpdateMemberRoleUseCase;
  updateDailyLimitsUseCase: UpdateDailyLimitsUseCase;

  // Use Cases - Location
  shareLocationUseCase: ShareLocationUseCase;
  getCircleLocationsUseCase: GetCircleLocationsUseCase;

  // Use Cases - Zone
  createZoneUseCase: CreateZoneUseCase;
  updateZoneUseCase: UpdateZoneUseCase;
  deleteZoneUseCase: DeleteZoneUseCase;
  getZonesByCircleUseCase: GetZonesByCircleUseCase;

  // Use Cases - Privacy
  activatePrivacyModeUseCase: ActivatePrivacyModeUseCase;
  deactivatePrivacyModeUseCase: DeactivatePrivacyModeUseCase;
}

export function createContainer(io: SocketIOServer | null = null): Container {
  // Repositories
  const userRepo = new PostgresUserRepository();
  const circleRepo = new PostgresCircleRepository();
  const zoneRepo = new PostgresZoneRepository();
  const locationRepo = new PostgresLocationRepository();
  const invitationRepo = new PostgresInvitationRepository();
  const refreshTokenRepo = new PostgresRefreshTokenRepository();

  // Services
  const tokenService = new JwtTokenService();
  const passwordHasher = new BcryptPasswordHasher();
  const locationCache = new UpstashLocationCache(null); // Redis client injected in production
  const notificationService = new FCMNotificationAdapter();
  const eventPublisher = new SocketIOEventPublisher(io);

  // Use Cases - Auth
  const registerUserUseCase = new RegisterUserUseCase(userRepo, refreshTokenRepo, tokenService, passwordHasher);
  const loginUserUseCase = new LoginUserUseCase(userRepo, refreshTokenRepo, tokenService, passwordHasher);
  const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepo, tokenService, userRepo);
  const logoutUseCase = new LogoutUseCase(refreshTokenRepo);

  // Use Cases - Circle
  const createCircleUseCase = new CreateCircleUseCase(circleRepo, eventPublisher);
  const inviteMemberUseCase = new InviteMemberUseCase(circleRepo, invitationRepo, eventPublisher);
  const acceptInvitationUseCase = new AcceptInvitationUseCase(circleRepo, invitationRepo);
  const dissolveCircleUseCase = new DissolveCircleUseCase(circleRepo, zoneRepo, invitationRepo, notificationService);
  const removeMemberUseCase = new RemoveMemberUseCase(circleRepo);
  const updateMemberRoleUseCase = new UpdateMemberRoleUseCase(circleRepo);
  const updateDailyLimitsUseCase = new UpdateDailyLimitsUseCase(circleRepo, { save: async () => {}, findByUserAndCircle: async () => null });

  // Use Cases - Location
  const shareLocationUseCase = new ShareLocationUseCase(userRepo, circleRepo, locationRepo, zoneRepo, locationCache, eventPublisher);
  const getCircleLocationsUseCase = new GetCircleLocationsUseCase(circleRepo, locationRepo, userRepo);

  // Use Cases - Zone
  const createZoneUseCase = new CreateZoneUseCase(circleRepo, zoneRepo);
  const updateZoneUseCase = new UpdateZoneUseCase(circleRepo, zoneRepo);
  const deleteZoneUseCase = new DeleteZoneUseCase(circleRepo, zoneRepo);
  const getZonesByCircleUseCase = new GetZonesByCircleUseCase(circleRepo, zoneRepo);

  // Use Cases - Privacy
  const activatePrivacyModeUseCase = new ActivatePrivacyModeUseCase(userRepo, circleRepo, eventPublisher);
  const deactivatePrivacyModeUseCase = new DeactivatePrivacyModeUseCase(userRepo, eventPublisher);

  return {
    userRepo, circleRepo, zoneRepo, locationRepo, invitationRepo, refreshTokenRepo,
    tokenService, passwordHasher, locationCache, notificationService, eventPublisher,
    registerUserUseCase, loginUserUseCase, refreshTokenUseCase, logoutUseCase,
    createCircleUseCase, inviteMemberUseCase, acceptInvitationUseCase, dissolveCircleUseCase,
    removeMemberUseCase, updateMemberRoleUseCase, updateDailyLimitsUseCase,
    shareLocationUseCase, getCircleLocationsUseCase,
    createZoneUseCase, updateZoneUseCase, deleteZoneUseCase, getZonesByCircleUseCase,
    activatePrivacyModeUseCase, deactivatePrivacyModeUseCase,
  };
}
