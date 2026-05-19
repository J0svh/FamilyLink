import { describe, it, expect, beforeEach } from 'vitest';
import { CreateZoneUseCase } from '../../../src/application/use-cases/zone/CreateZoneUseCase';
import { UpdateZoneUseCase } from '../../../src/application/use-cases/zone/UpdateZoneUseCase';
import { DeleteZoneUseCase } from '../../../src/application/use-cases/zone/DeleteZoneUseCase';
import { GetZonesByCircleUseCase } from '../../../src/application/use-cases/zone/GetZonesByCircleUseCase';
import { InMemoryCircleRepository } from '../mocks/InMemoryCircleRepository';
import { InMemoryZoneRepository } from '../mocks/InMemoryZoneRepository';
import { Circle } from '../../../src/domain/aggregates/circle/Circle';
import { CircleId } from '../../../src/domain/value-objects/CircleId';
import { UserId } from '../../../src/domain/value-objects/UserId';

describe('Zone Use Cases', () => {
  let circleRepo: InMemoryCircleRepository;
  let zoneRepo: InMemoryZoneRepository;
  let createZoneUseCase: CreateZoneUseCase;
  let updateZoneUseCase: UpdateZoneUseCase;
  let deleteZoneUseCase: DeleteZoneUseCase;
  let getZonesUseCase: GetZonesByCircleUseCase;

  const adminUserId = UserId.create();
  const memberUserId = UserId.create();
  const circleId = CircleId.create();

  const validVertices = [
    { lat: 40.4168, lng: -3.7038 },
    { lat: 40.4268, lng: -3.6938 },
    { lat: 40.4068, lng: -3.6938 },
  ];

  beforeEach(async () => {
    circleRepo = new InMemoryCircleRepository();
    zoneRepo = new InMemoryZoneRepository();
    createZoneUseCase = new CreateZoneUseCase(circleRepo, zoneRepo);
    updateZoneUseCase = new UpdateZoneUseCase(circleRepo, zoneRepo);
    deleteZoneUseCase = new DeleteZoneUseCase(circleRepo, zoneRepo);
    getZonesUseCase = new GetZonesByCircleUseCase(circleRepo, zoneRepo);

    // Setup circle with admin and member
    const circle = Circle.create({
      id: circleId,
      name: 'Family',
      createdBy: adminUserId,
    });
    circle.addMember(memberUserId);
    await circleRepo.save(circle);
  });

  describe('CreateZoneUseCase', () => {
    it('should create a zone successfully', async () => {
      const result = await createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'Home',
        colorHex: '#FF5733',
        vertices: validVertices,
      });

      expect(result.zoneId).toBeDefined();
      expect(result.name).toBe('Home');
      expect(result.areaSqm).toBeGreaterThan(100);
    });

    it('should reject non-admin', async () => {
      await expect(createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: memberUserId.getValue(),
        name: 'Home',
        colorHex: '#FF5733',
        vertices: validVertices,
      })).rejects.toThrow('Only circle admins');
    });

    it('should reject when max zones reached (20)', async () => {
      for (let i = 0; i < 20; i++) {
        await createZoneUseCase.execute({
          circleId: circleId.getValue(),
          userId: adminUserId.getValue(),
          name: `Zone ${i}`,
          colorHex: '#FF5733',
          vertices: validVertices,
        });
      }

      await expect(createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'Zone 21',
        colorHex: '#FF5733',
        vertices: validVertices,
      })).rejects.toThrow('Maximum');
    });

    it('should reject invalid polygon (too few vertices)', async () => {
      await expect(createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'Home',
        colorHex: '#FF5733',
        vertices: [{ lat: 40, lng: -3 }, { lat: 41, lng: -3 }],
      })).rejects.toThrow('at least 3');
    });

    it('should reject invalid color hex', async () => {
      await expect(createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'Home',
        colorHex: 'invalid',
        vertices: validVertices,
      })).rejects.toThrow();
    });
  });

  describe('UpdateZoneUseCase', () => {
    let zoneId: string;

    beforeEach(async () => {
      const result = await createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'Home',
        colorHex: '#FF5733',
        vertices: validVertices,
      });
      zoneId = result.zoneId;
    });

    it('should update zone name', async () => {
      const result = await updateZoneUseCase.execute({
        zoneId,
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'School',
      });

      expect(result.name).toBe('School');
    });

    it('should update zone color', async () => {
      await updateZoneUseCase.execute({
        zoneId,
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        colorHex: '#00FF00',
      });

      const zones = await getZonesUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
      });
      expect(zones.zones[0].colorHex).toBe('#00FF00');
    });

    it('should reject non-admin', async () => {
      await expect(updateZoneUseCase.execute({
        zoneId,
        circleId: circleId.getValue(),
        userId: memberUserId.getValue(),
        name: 'New Name',
      })).rejects.toThrow('Only circle admins');
    });
  });

  describe('DeleteZoneUseCase', () => {
    let zoneId: string;

    beforeEach(async () => {
      const result = await createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'Home',
        colorHex: '#FF5733',
        vertices: validVertices,
      });
      zoneId = result.zoneId;
    });

    it('should delete a zone', async () => {
      await deleteZoneUseCase.execute({
        zoneId,
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
      });

      const zones = await getZonesUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
      });
      expect(zones.zones.length).toBe(0);
    });

    it('should reject non-admin', async () => {
      await expect(deleteZoneUseCase.execute({
        zoneId,
        circleId: circleId.getValue(),
        userId: memberUserId.getValue(),
      })).rejects.toThrow('Only circle admins');
    });
  });

  describe('GetZonesByCircleUseCase', () => {
    it('should return all active zones', async () => {
      await createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'Home',
        colorHex: '#FF5733',
        vertices: validVertices,
      });
      await createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'School',
        colorHex: '#00FF00',
        vertices: validVertices,
      });

      const result = await getZonesUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
      });

      expect(result.zones.length).toBe(2);
    });

    it('should allow members to view zones', async () => {
      await createZoneUseCase.execute({
        circleId: circleId.getValue(),
        userId: adminUserId.getValue(),
        name: 'Home',
        colorHex: '#FF5733',
        vertices: validVertices,
      });

      const result = await getZonesUseCase.execute({
        circleId: circleId.getValue(),
        userId: memberUserId.getValue(),
      });

      expect(result.zones.length).toBe(1);
    });

    it('should reject non-member', async () => {
      await expect(getZonesUseCase.execute({
        circleId: circleId.getValue(),
        userId: UserId.create().getValue(),
      })).rejects.toThrow('not a member');
    });
  });
});
