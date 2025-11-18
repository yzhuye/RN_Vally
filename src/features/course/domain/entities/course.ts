import { Category } from '../../../category/domain/entities/category';
import { Group } from './group';

export class Course {
  constructor(
    public readonly _id: string,
    public title: string,
    public description: string,
    public invitationCode: string,
    public createdBy: string,
    public enrolledStudents: string[],
    public enrolledStudentInfo: StudentInfo[],
    public categories: Category[] = [],
    public groups: Group[] = [],
    public imageUrl?: string) {}

  static fromJson(json: any): Course {
    return new Course(
      json._id || '',
      json.title || '',
      json.description || '',
      json.invitationCode || '',
      json.createdBy || '',
      Array.isArray(json.enrolledStudents) ? json.enrolledStudents : [],
      (json.enrolledStudentInfo || []).map((s: any) => ({
        id: s.id || '',
        name: s.name || '',
        email: s.email || '',
        enrollmentDate: new Date(s.enrollmentDate || Date.now())
      })),
      (json.categories || []).map((c: any) => Category.fromJson(c)),
      (json.groups || []).map((g: any) => Group.fromJson(g)),
      json.imageUrl
    );
  }

  toJson(): any {
    return {
      _id: this._id,
      title: this.title,
      description: this.description,
      invitationCode: this.invitationCode,
      createdBy: this.createdBy,
      enrolledStudents: this.enrolledStudents,
      enrolledStudentInfo: this.enrolledStudentInfo,
      categories: this.categories.map(c => c.toJson()),
      groups: this.groups.map(g => g.toJson()),
      imageUrl: this.imageUrl
    };
  }
}

export type StudentInfo = {
  id: string;
  name: string;
  email: string;
  enrollmentDate: Date;
}