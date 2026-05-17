import { describe, it, expect, beforeEach } from 'vitest';
import { ActivatePrivacyModeUseCase } from '../../../src/application/use-cases/privacy/ActivatePrivacyModeUseCase';
import { DeactivatePrivacyModeUseCase } from '../../../src/application/use-cases/privacy/DeactivatePrivacyModeUseCase';
import { InMemoryUserRepository } from '../mocks/InMemoryUserRepository';
import { InMemoryCircleRepository } from '../mocks/InMemoryCircleRepository';
import { FakeEventPublisher } from '../mocks/FakeEventPublisher';
import { User } from '../../../src/domain/aggregates/user/User';
import { Circle } from '../../../src/domain/aggregates/circle/Circle';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { CircleId } from '../../../src/domain/value-objects/CircleId';
import { Email } from '../../../src/domain/value-objects/Email';

describe('Privacy Use Cases', () => {
  let userRepo: InMemoryUserRepository;
  let circleRepo: InMemoryCircleRepository;
  let eventPublisher: FakeEventPublisher;
  let activateUseCase: ActivatePrivacyModeUseCase;
  let deactivateUseCase: DeactivatePrivacyModeUseCase;

  const userId = UserId.create();
  const circleId = CircleId.create();

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    circleRepo = new InMemoryCircleRepository();
    eventPublisher = new FakeEventPublisher();
    activateUseCase = new ActivatePrivacyModeUseCase(userRepo, circleRepo, eventPublisher);
    deactivateUseCase = new DeactivatePrivacyModeUseCase(userRepo, eventPublisher);

    // Setup user and circle
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

  describe('ActivatePrivacyModeUseCase', () => {
    it('should activate privacy mode', async () => {
      const result = await activateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        durationMinutes: 30,
      });

      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.activationsRemaining).toBe(4);
    });

    it('should emit PrivacyModeActivated event', async () => {
      await activateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        durationMinutes: 30,
      });

      expect(eventPublisher.getEventsByName('PrivacyModeActivated').length).toBe(1);
    });

    it('should reject duration less than 15 minutes', async () => {
      await expect(activateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        durationMinutes: 10,
      })).rejects.toThrow('at least 15');
    });

    it('should reject duration more than 480 minutes', async () => {
      await expect(activateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        durationMinutes: 500,
      })).rejects.toThrow('at most 480');
    });

    it('should reject after 5 activations per day', async () => {
      for (let i = 0; i < 5; i++) {
        await activateUseCase.execute({
          userId: userId.getValue(),
          circleId: circleId.getValue(),
          durationMinutes: 15,
        });
        // Deactivate to allow next activation
        await deactivateUseCase.execute({
          userId: userId.getValue(),
          circleId: circleId.getValue(),
        });
      }

      await expect(activateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        durationMinutes: 15,
      })).rejects.toThrow('5 privacy mode activations');
    });

    it('should reject non-member', async () => {
      const otherUser = User.create({
        id: UserId.create(),
        email: Email.create('other@example.com'),
        username: 'other',
        passwordHash: 'hash',
      });
      await userRepo.save(otherUser);

      await expect(activateUseCase.execute({
        userId: otherUser.getId().getValue(),
        circleId: circleId.getValue(),
        durationMinutes: 30,
      })).rejects.toThrow('not a member');
    });

    it('should reject non-existent user', async () => {
      await expect(activateUseCase.execute({
        userId: UserId.create().getValue(),
        circleId: circleId.getValue(),
        durationMinutes: 30,
      })).rejects.toThrow('User not found');
    });
  });

  describe('DeactivatePrivacyModeUseCase', () => {
    beforeEach(async () => {
      await activateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
        durationMinutes: 30,
      });
      eventPublisher.clear();
    });

    it('should deactivate privacy mode', async () => {
      await deactivateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
      });

      const user = await userRepo.findById(userId);
      expect(user!.isPrivacyModeActive()).toBe(false);
    });

    it('should emit PrivacyModeDeactivated event', async () => {
      await deactivateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
      });

      expect(eventPublisher.getEventsByName('PrivacyModeDeactivated').length).toBe(1);
    });

    it('should reject when not active', async () => {
      await deactivateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
      });

      await expect(deactivateUseCase.execute({
        userId: userId.getValue(),
        circleId: circleId.getValue(),
      })).rejects.toThrow('not active');
    });

    it('should reject non-existent user', async () => {
      await expect(deactivateUseCase.execute({
        userId: UserId.create().getValue(),
        circleId: circleId.getValue(),
      })).rejects.toThrow('User not found');
    });
  });
});
