import { describe, it, expect, beforeEach } from 'vitest';
import { ShareLocationUseCase } from '../../../src/application/use-cases/location/ShareLocationUseCase';
import { GetCircleLocationsUseCase } from '../../../src/application/use-cases/location/GetCircleLocationsUseCase';
import { InMemoryUserRepository } from '../mocks/InMemoryUserRepository';
import { InMemoryCircleRepository } from '../mocks/InMemoryCircleRepository';
import { InMemoryLocationRepository } from '../mocks/InMemoryLocationRepository';
import { InMemoryZoneRepository } from '../mocks/InMemoryZoneRepository';
import { FakeEventPublisher } from '../mocks/FakeEventPublisher';
import { FakeLocationCache } from '../mocks/FakeLocationCache';
import { User } from '../../../src/domain/aggregates/user/User';
import { Circle } from '../../../src/domain/aggregates/circle/Circle';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { CircleId } from '../../../src/domain/value-objects/CircleId';
import { Email } from '../../../src/domain/value-objects/Email';

describe('Location Use Cases', () => {
  let userRepo: InMemoryUserRepository;
  let circleRepo: InMemoryCircleRepository;
  let locationRepo: InMemoryLocationRepository;
  let zoneRepo: InMemoryZoneRepository;
  let eventPublisher: FakeEventPublisher;
  let locationCache: FakeLocationCache;
  let shareLocationUseCase: ShareLocationUseCase;
  let getCircleLocationsUseCase: GetCircleLocationsUseCase;

  const userId = UserId.create();
  const circleId = CircleId.create();

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    circleRepo = new InMemoryCircleRepository();
    locationRepo = new InMemoryLocationRepository();
    zoneRepo = new InMemoryZoneRepository();
    eventPublisher = new FakeEventPublisher();
    locationCache = new FakeLocationCache();

    shareLocationUseCase = new ShareLocationUseCase(
      userRepo, circleRepo, locationRepo, zoneRepo, locationCache, eventPublisher,
    );
    getCircleLocationsUseCase = new GetCircleLocationsUseCase(
      circleRepo, locationRepo, userRepo,
    );

    // Setup: create user and circle
    const user = User.create({
      id: userId,
      email: Email.create('user@example.com'),
      username: 'testuser',
      passwordHash: 'hashed_password',
    });
    await userRepo.save(user);

    const circle = Circle.create({
      id: circleId,
      name: 'Family',
      createdBy: userId,
    });
    await circleRepo.save(circle);
  });

  describe('ShareLocationUseCase', () => {
    it('should share location successfully', async () => {
      const result = await shareLocationUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        latitude: 40.4168,
        longitude: -3.7038,
      });

      expect(result.locationId).toBeDefined();
      expect(result.capturedAt).toBeInstanceOf(Date);
      expect(result.zonesEntered).toEqual([]);
      expect(result.zonesExited).toEqual([]);
    });

    it('should emit LocationShared event', async () => {
      await shareLocationUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        latitude: 40.4168,
        longitude: -3.7038,
      });

      expect(eventPublisher.getEventsByName('LocationShared').length).toBe(1);
    });

    it('should update location cache', async () => {
      await shareLocationUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        latitude: 40.4168,
        longitude: -3.7038,
      });

      const cached = await locationCache.getActiveLocation(userId);
      expect(cached).not.toBeNull();
      expect(cached!.getLatitude()).toBe(40.4168);
    });

    it('should reject when user not found', async () => {
      await expect(shareLocationUseCase.execute({
        userId: UserId.create().getValue(),
        circleId: circleId.getValue(),
        latitude: 40.4168,
        longitude: -3.7038,
      })).rejects.toThrow('User not found');
    });

    it('should reject when not a member', async () => {
      const otherUser = User.create({
        id: UserId.create(),
        email: Email.create('other@example.com'),
        username: 'other',
        passwordHash: 'hash',
      });
      await userRepo.save(otherUser);

      await expect(shareLocationUseCase.execute({
        userId: otherUser.getId().getValue(),
        circleId: circleId.getValue(),
        latitude: 40.4168,
        longitude: -3.7038,
      })).rejects.toThrow('not a member');
    });

    it('should reject when privacy mode is active', async () => {
      const user = await userRepo.findById(userId);
      user!.activatePrivacyMode(circleId, 30);
      await userRepo.save(user!);

      await expect(shareLocationUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        latitude: 40.4168,
        longitude: -3.7038,
      })).rejects.toThrow('privacy mode');
    });

    it('should reject invalid coordinates', async () => {
      await expect(shareLocationUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        latitude: 91,
        longitude: -3.7038,
      })).rejects.toThrow();
    });
  });

  describe('GetCircleLocationsUseCase', () => {
    it('should return member locations', async () => {
      // Share a location first
      await shareLocationUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        latitude: 40.4168,
        longitude: -3.7038,
      });

      const result = await getCircleLocationsUseCase.execute({
        circleId: circleId.getValue(),
        requestingUserId: userId.getValue(),
      });

      expect(result.members.length).toBe(1);
      expect(result.members[0].latitude).toBe(40.4168);
      expect(result.members[0].isPrivacyModeActive).toBe(false);
    });

    it('should hide location when privacy mode is active', async () => {
      await shareLocationUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        latitude: 40.4168,
        longitude: -3.7038,
      });

      // Activate privacy mode
      const user = await userRepo.findById(userId);
      user!.activatePrivacyMode(circleId, 30);
      await userRepo.save(user!);

      const result = await getCircleLocationsUseCase.execute({
        circleId: circleId.getValue(),
        requestingUserId: userId.getValue(),
      });

      expect(result.members[0].isPrivacyModeActive).toBe(true);
      expect(result.members[0].latitude).toBe(0);
      expect(result.members[0].longitude).toBe(0);
    });

    it('should reject non-member', async () => {
      const otherUser = User.create({
        id: UserId.create(),
        email: Email.create('other@example.com'),
        username: 'other',
        passwordHash: 'hash',
      });
      await userRepo.save(otherUser);

      await expect(getCircleLocationsUseCase.execute({
        circleId: circleId.getValue(),
        requestingUserId: otherUser.getId().getValue(),
      })).rejects.toThrow('not a member');
    });
  });
});
