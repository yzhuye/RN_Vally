import { StudentReport } from '../entities/reportTypes';
import { ReportRepository } from '../repositories/report.repository';

export class GetStudentReportsUseCase {
  constructor(private repository: ReportRepository) {}

  async execute(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: StudentReport[] }> {
    return this.repository.getStudentReports(categoryId);
  }
}
