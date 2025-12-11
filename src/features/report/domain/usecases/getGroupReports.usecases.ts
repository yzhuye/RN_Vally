import { GroupReport } from '../entities/reportTypes';
import { ReportRepository } from '../repositories/report.repository';

export class GetGroupReportsUseCase {
  constructor(private repository: ReportRepository) {}

  async execute(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: GroupReport[] }> {
    return this.repository.getGroupReports(categoryId);
  }
}
