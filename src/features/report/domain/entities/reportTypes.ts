// Simple report types that match the ReportScreen interface
export type ActivityReport = {
  activityId: string;
  activityName: string;
  averageScore: number;
  evaluationCount: number;
};

export type GroupReport = {
  groupId: string;
  groupName: string;
  averageScore: number;
  memberCount: number;
};

export type StudentReport = {
  studentEmail: string;
  averageScore: number;
  evaluationCount: number;
};
