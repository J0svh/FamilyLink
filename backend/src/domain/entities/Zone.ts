import { ZoneId } from '../value-objects/ZoneId';
import { CircleId } from '../value-objects/CircleId';
import { ColorHex } from '../value-objects/ColorHex';
import { ZonePolygon } from '../value-objects/ZonePolygon';

export interface ZoneProps {
  id: ZoneId;
  circleId: CircleId;
  name: string;
  nameEn?: string;
  colorHex: ColorHex;
  polygon: ZonePolygon;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Zone {
  private _id: ZoneId;
  private _circleId: CircleId;
  private _name: string;
  private _nameEn: string | undefined;
  private _colorHex: ColorHex;
  private _polygon: ZonePolygon;
  private _active: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ZoneProps) {
    this._id = props.id;
    this._circleId = props.circleId;
    this._name = props.name;
    this._nameEn = props.nameEn;
    this._colorHex = props.colorHex;
    this._polygon = props.polygon;
    this._active = props.active ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: ZoneProps): Zone {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Zone name is required');
    }
    if (props.name.length > 100) {
      throw new Error('Zone name must be 100 characters or less');
    }
    return new Zone(props);
  }

  getId(): ZoneId { return this._id; }
  getCircleId(): CircleId { return this._circleId; }
  getName(): string { return this._name; }
  getNameEn(): string | undefined { return this._nameEn; }
  getColorHex(): ColorHex { return this._colorHex; }
  getPolygon(): ZonePolygon { return this._polygon; }
  getAreaSqm(): number { return this._polygon.getAreaSqm(); }
  isActive(): boolean { return this._active; }
  getCreatedAt(): Date { return this._createdAt; }
  getUpdatedAt(): Date { return this._updatedAt; }

  updateName(name: string, nameEn?: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Zone name is required');
    }
    this._name = name;
    this._nameEn = nameEn;
    this._updatedAt = new Date();
  }

  updateColor(colorHex: ColorHex): void {
    this._colorHex = colorHex;
    this._updatedAt = new Date();
  }

  updatePolygon(polygon: ZonePolygon): void {
    this._polygon = polygon;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._active = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._active = true;
    this._updatedAt = new Date();
  }
}
