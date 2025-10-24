export class Course {
  constructor(
    public readonly _id: string,
    public title: string,
    public description: string,
    public invitationCode: string,
    public createdBy: string,
    public enrolledStudents: string[],
    public enrolledStudentInfo: StudentInfo[],
    public categories: string[],
    public groups: string[],
    public imageUrl?: string) {}

}

export type StudentInfo = {
  id: string;
  name: string;
  email: string;
  enrollmentDate: Date;
}