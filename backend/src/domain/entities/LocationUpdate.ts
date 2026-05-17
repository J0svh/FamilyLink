import { UserId } from '../value-objects/UserId';
import { CircleId } from '../value-objects/CircleId';
import { Coordinates } from '../value-objects/Coordinates';

export interface LocationUpdateProps {
  id: string;
  userId: UserId;
  circleId: CircleId;
  coordinates: Coordinates;
  capturedAt: Date;
  createdAt?: Date;
}

export class LocationUpdate {
  private constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private readonly circleId: CircleId,
    private readonly coordinates: Coordinates,
    private readonly capturedAt: Date,
    private readonly createdAt: Date,
  ) {
    Object.freeze(this);
  }

  static create(props: LocationUpdateProps): LocationUpdate {
    if (!props.id) throw new Error('LocationUpdate id is required');
    if (!props.userId) throw new Error('LocationUpdate userId is required');
    if (!props.circleId) throw new Error('LocationUpdate circleId is required');
    if (!props.coordinates) throw new Error('LocationUpdate coordinates is required');
    if (!props.capturedAt) throw new Error('LocationUpdate capturedAt is required');

    return new LocationUpdate(
      props.id,
      props.userId,
      props.circleId,
      props.coordinates,
      props.capturedAt,
      props.createdAt ?? new Date(),
    );
  }

  getId(): string { return this.id; }
  getUserId(): UserId { return this.userId; }
  getCircleId(): CircleId { return this.circleId; }
  getCoordinates(): Coordinates { return this.coordinates; }
  getCapturedAt(): Date { return this.capturedAt; }
  getCreatedAt(): Date { return this.createdAt; }
}
