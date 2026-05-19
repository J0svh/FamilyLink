import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCircleUseCase } from '../../../src/application/use-cases/circle/CreateCircleUseCase';
import { InviteMemberUseCase } from '../../../src/application/use-cases/circle/InviteMemberUseCase';
import { AcceptInvitationUseCase } from '../../../src/application/use-cases/circle/AcceptInvitationUseCase';
import { RemoveMemberUseCase } from '../../../src/application/use-cases/circle/RemoveMemberUseCase';
import { UpdateMemberRoleUseCase } from '../../../src/application/use-cases/circle/UpdateMemberRoleUseCase';
import { DissolveCircleUseCase } from '../../../src/application/use-cases/circle/DissolveCircleUseCase';
import { InMemoryCircleRepository } from '../mocks/InMemoryCircleRepository';
import { InMemoryInvitationRepository } from '../mocks/InMemoryInvitationRepository';
import { InMemoryZoneRepository } from '../mocks/InMemoryZoneRepository';
import { FakeEventPublisher } from '../mocks/FakeEventPublisher';
import { FakeNotificationService } from '../mocks/FakeNotificationService';
import { UserId } from '../../../src/domain/value-objects/UserId';

describe('Circle Use Cases', () => {
  let circleRepo: InMemoryCircleRepository;
  let invitationRepo: InMemoryInvitationRepository;
  let zoneRepo: InMemoryZoneRepository;
  let eventPublisher: FakeEventPublisher;
  let notificationService: FakeNotificationService;
  let createCircleUseCase: CreateCircleUseCase;
  let inviteMemberUseCase: InviteMemberUseCase;
  let acceptInvitationUseCase: AcceptInvitationUseCase;
  let removeMemberUseCase: RemoveMemberUseCase;
  let updateMemberRoleUseCase: UpdateMemberRoleUseCase;
  let dissolveCircleUseCase: DissolveCircleUseCase;

  const adminUserId = UserId.create();
  const memberUserId = UserId.create();

  beforeEach(() => {
    circleRepo = new InMemoryCircleRepository();
    invitationRepo = new InMemoryInvitationRepository();
    zoneRepo = new InMemoryZoneRepository();
    eventPublisher = new FakeEventPublisher();
    notificationService = new FakeNotificationService();
    createCircleUseCase = new CreateCircleUseCase(circleRepo, eventPublisher);
    inviteMemberUseCase = new InviteMemberUseCase(circleRepo, invitationRepo, eventPublisher);
    acceptInvitationUseCase = new AcceptInvitationUseCase(circleRepo, invitationRepo);
    removeMemberUseCase = new RemoveMemberUseCase(circleRepo);
    updateMemberRoleUseCase = new UpdateMemberRoleUseCase(circleRepo);
    dissolveCircleUseCase = new DissolveCircleUseCase(circleRepo, zoneRepo, invitationRepo, notificationService);
  });

  describe('CreateCircleUseCase', () => {
    it('should create a circle and assign creator as admin', async () => {
      const result = await createCircleUseCase.execute({
        name: 'Family',
        userId: adminUserId.getValue(),
      });

      expect(result.circleId).toBeDefined();
      expect(result.name).toBe('Family');
      expect(result.role).toBe('CIRCLE_ADMIN');
    });

    it('should emit CircleCreated event', async () => {
      await createCircleUseCase.execute({
        name: 'Family',
        userId: adminUserId.getValue(),
      });

      expect(eventPublisher.getEventsByName('CircleCreated').length).toBe(1);
    });

    it('should reject when user has 10 circles', async () => {
      for (let i = 0; i < 10; i++) {
        await createCircleUseCase.execute({
          name: `Circle ${i}`,
          userId: adminUserId.getValue(),
        });
      }

      await expect(createCircleUseCase.execute({
        name: 'Circle 11',
        userId: adminUserId.getValue(),
      })).rejects.toThrow('Maximum');
    });
  });

  describe('InviteMemberUseCase', () => {
    let circleId: string;

    beforeEach(async () => {
      const result = await createCircleUseCase.execute({
        name: 'Family',
        userId: adminUserId.getValue(),
      });
      circleId = result.circleId;
    });

    it('should create an invitation', async () => {
      const result = await inviteMemberUseCase.execute({
        circleId,
        invitedByUserId: adminUserId.getValue(),
        email: 'member@example.com',
      });

      expect(result.invitationId).toBeDefined();
      expect(result.email).toBe('member@example.com');
    });

    it('should emit MemberInvited event', async () => {
      eventPublisher.clear();
      await inviteMemberUseCase.execute({
        circleId,
        invitedByUserId: adminUserId.getValue(),
        email: 'member@example.com',
      });

      expect(eventPublisher.getEventsByName('MemberInvited').length).toBe(1);
    });

    it('should reject non-admin inviter', async () => {
      await expect(inviteMemberUseCase.execute({
        circleId,
        invitedByUserId: memberUserId.getValue(),
        email: 'member@example.com',
      })).rejects.toThrow('Only circle admins');
    });

    it('should reject duplicate pending invitation', async () => {
      await inviteMemberUseCase.execute({
        circleId,
        invitedByUserId: adminUserId.getValue(),
        email: 'member@example.com',
      });

      await expect(inviteMemberUseCase.execute({
        circleId,
        invitedByUserId: adminUserId.getValue(),
        email: 'member@example.com',
      })).rejects.toThrow('pending invitation');
    });
  });

  describe('AcceptInvitationUseCase', () => {
    let circleId: string;
    let invitationId: string;

    beforeEach(async () => {
      const circleResult = await createCircleUseCase.execute({
        name: 'Family',
        userId: adminUserId.getValue(),
      });
      circleId = circleResult.circleId;

      const invResult = await inviteMemberUseCase.execute({
        circleId,
        invitedByUserId: adminUserId.getValue(),
        email: 'member@example.com',
      });
      invitationId = invResult.invitationId;
    });

    it('should accept invitation and add member', async () => {
      const result = await acceptInvitationUseCase.execute({
        invitationId,
        userId: memberUserId.getValue(),
      });

      expect(result.circleId).toBe(circleId);
      expect(result.role).toBe('CIRCLE_MEMBER');
    });

    it('should reject already accepted invitation', async () => {
      await acceptInvitationUseCase.execute({
        invitationId,
        userId: memberUserId.getValue(),
      });

      await expect(acceptInvitationUseCase.execute({
        invitationId,
        userId: UserId.create().getValue(),
      })).rejects.toThrow();
    });
  });

  describe('RemoveMemberUseCase', () => {
    let circleId: string;

    beforeEach(async () => {
      const circleResult = await createCircleUseCase.execute({
        name: 'Family',
        userId: adminUserId.getValue(),
      });
      circleId = circleResult.circleId;

      // Add member directly via repo for simplicity
      const circle = await circleRepo.findById((await circleRepo.findByMemberId(adminUserId))[0].getId());
      circle!.addMember(memberUserId);
      await circleRepo.save(circle!);
    });

    it('should remove a member', async () => {
      await removeMemberUseCase.execute({
        circleId,
        requestingUserId: adminUserId.getValue(),
        targetUserId: memberUserId.getValue(),
      });

      const circle = (await circleRepo.findByMemberId(adminUserId))[0];
      expect(circle.isMember(memberUserId)).toBe(false);
    });

    it('should reject non-admin requester', async () => {
      await expect(removeMemberUseCase.execute({
        circleId,
        requestingUserId: memberUserId.getValue(),
        targetUserId: adminUserId.getValue(),
      })).rejects.toThrow('Only circle admins');
    });
  });

  describe('DissolveCircleUseCase', () => {
    let circleId: string;

    beforeEach(async () => {
      const result = await createCircleUseCase.execute({
        name: 'Family',
        userId: adminUserId.getValue(),
      });
      circleId = result.circleId;
    });

    it('should dissolve a circle', async () => {
      await dissolveCircleUseCase.execute({
        circleId,
        userId: adminUserId.getValue(),
      });

      const circle = await circleRepo.findById((await import('../../../src/domain/value-objects/CircleId')).CircleId.create(circleId));
      expect(circle).toBeNull();
    });

    it('should reject non-admin', async () => {
      await expect(dissolveCircleUseCase.execute({
        circleId,
        userId: memberUserId.getValue(),
      })).rejects.toThrow('Only circle admins');
    });

    it('should send notification to members', async () => {
      await dissolveCircleUseCase.execute({
        circleId,
        userId: adminUserId.getValue(),
      });

      expect(notificationService.pushNotifications.length).toBe(1);
    });
  });
});
