import { Report } from "../entities/report";

export interface ReportRepository {
    generateReportData(courseId: string, categoryId: string): Promise<Report>;
    getActivityAverageReport(courseId: string, categoryId: string): Promise<Report['activityAverage']>;
    getGroupAverageReports(courseId: string, categoryId: string): Promise<Report['groupAverages']>;
    getStudentAverageReports(courseId: string, categoryId: string): Promise<Report['studentAverages']>;
    getDetailedResultReports(courseId: string, categoryId: string): Promise<Report['detailedResults']>;
    getEvaluationsByCategory(categoryId: string): Promise<any[]>; // Replace 'any' with appropriate Evaluation type
    getActivitiesByCategory(categoryId: string): Promise<any[]>; // Replace 'any' with appropriate Activity type
    getGroupsByCategory(courseId: string, categoryId: string): Promise<any[]>; // Replace 'any' with appropriate Group type
}