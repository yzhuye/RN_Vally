import { ActivityReport } from '../entities/reportTypes';
import { ReportRepository } from '../repositories/report.repository';

export class GetActivityReportsUseCase {
  constructor(private repository: ReportRepository) {}

  async execute(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: ActivityReport[] }> {
    return this.repository.getActivityReports(categoryId);
  }
}
