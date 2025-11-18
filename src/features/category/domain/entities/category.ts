export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public groupingMethod: 'random' | 'self-assigned' | 'manual',
    public groupCount: number,
    public studentsPerGroup: number,
    public activities: Activity[] = []
  ) {}

  static fromJson(json: any): Category {
    return new Category(
      json._id || json.id || '',
      json.name || '',
      json.groupingMethod || 'manual',
      typeof json.groupCount === 'number' ? json.groupCount : parseInt(json.groupCount || '0'),
      typeof json.studentsPerGroup === 'number' ? json.studentsPerGroup : parseInt(json.studentsPerGroup || '0'),
      (json.activities || []).map((a: any) => Activity.fromJson(a))
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      groupingMethod: this.groupingMethod,
      groupCount: this.groupCount,
      studentsPerGroup: this.studentsPerGroup,
      activities: this.activities.map(a => a.toJson())
    };
  }
}

export class Activity {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public dueDate: Date,
    public categoryId: string,
    public evaluations: Evaluation[] = []
  ) {}

  static fromJson(json: any): Activity {
    return new Activity(
      json._id || json.id || '',
      json.name || '',
      json.description || '',
      new Date(json.dueDate),
      json.categoryId || '',
      (json.evaluations || []).map((e: any) => Evaluation.fromJson(e))
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      description: this.description,
      dueDate: this.dueDate.toISOString(),
      categoryId: this.categoryId,
      evaluations: this.evaluations.map(e => e.toJson())
    };
  }
}

export class Evaluation {
  constructor(
    public readonly id: string,
    public activityId: string,
    public evaluatorId: string,
    public evaluatedId: string,
    public punctuality: number, // 0-5
    public contributions: number, // 0-5
    public commitment: number, // 0-5
    public attitude: number, // 0-5
    public createdAt: Date
  ) {}

  get isValid(): boolean {
    return this.isValidMetric(this.punctuality) &&
           this.isValidMetric(this.contributions) &&
           this.isValidMetric(this.commitment) &&
           this.isValidMetric(this.attitude);
  }

  private isValidMetric(metric: number): boolean {
    return metric >= 0 && metric <= 5;
  }

  get averageRating(): number {
    return (this.punctuality + this.contributions + this.commitment + this.attitude) / 4.0;
  }

  static fromJson(json: any): Evaluation {
    return new Evaluation(
      json._id || json.id || '',
      json.activityId || '',
      json.evaluatorId || '',
      json.evaluatedId || '',
      json.punctuality || 0,
      json.contributions || 0,
      json.commitment || 0,
      json.attitude || 0,
      new Date(json.createdAt)
    );
  }

  toJson(): any {
    return {
      _id: this.id,
      activityId: this.activityId,
      evaluatorId: this.evaluatorId,
      evaluatedId: this.evaluatedId,
      punctuality: this.punctuality,
      contributions: this.contributions,
      commitment: this.commitment,
      attitude: this.attitude,
      createdAt: this.createdAt.toISOString()
    };
  }
}

