export class Group {
  constructor(
    public readonly id: string,
    public name: string,
    public maxCapacity: number,
    public currentCapacity: number = 0,
    public members: string[] = [],
    public categoryId: string
  ) {}

  get isFull(): boolean {
    return this.members.length >= this.maxCapacity;
  }

  get status(): string {
    return this.isFull ? 'Full' : 'Join';
  }

  get capacityText(): string {
    return `${this.members.length}/${this.maxCapacity}`;
  }

  static fromJson(json: any): Group {
    return new Group(
      json._id || json.id || '',
      json.name || '',
      typeof json.maxCapacity === 'number' ? json.maxCapacity : parseInt(json.maxCapacity?.toString() || '0'),
      typeof json.currentCapacity === 'number' ? json.currentCapacity : parseInt(json.currentCapacity?.toString() || '0'),
      Array.isArray(json.members) ? json.members : [],
      json.categoryId || ''
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      maxCapacity: this.maxCapacity,
      currentCapacity: this.currentCapacity,
      members: this.members,
      categoryId: this.categoryId
    };
  }
}

export class Student {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {}

  static fromJson(json: any): Student {
    return new Student(
      json._id || json.id || '',
      json.name || '',
      json.email || ''
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      email: this.email
    };
  }
}

