import { ActivityReport, GroupReport, StudentReport } from '../entities/reportTypes';

export interface ReportRepository {
  getActivityReports(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: ActivityReport[] }>;
  getGroupReports(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: GroupReport[] }>;
  getStudentReports(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: StudentReport[] }>;
}