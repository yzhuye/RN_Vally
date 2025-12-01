import { Report } from "../entities/report";
import { ReportRepository } from "../repositories/report.repository";

export class GenerateReportDataUseCase {
    constructor(private readonly repository: ReportRepository) {}
    async execute(params: { courseId: string; categoryId: string }): Promise<GenerateReportDataResult> {
        try {
            const reportData = await this.repository.generateReportData(params.courseId, params.categoryId);
            return GenerateReportDataResult.success('Reporte generado exitosamente', reportData);
        } catch (e) {
            return GenerateReportDataResult.failure(`Error al generar el reporte: ${e}`);
        }
    }
}

export class GenerateReportDataResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string,
        public readonly reportData: Report | null,
    ) {}

    static success(message: string, reportData: Report): GenerateReportDataResult {
        return new GenerateReportDataResult(true, message, reportData);
    }

    static failure(message: string): GenerateReportDataResult {
        return new GenerateReportDataResult(false, message, null);
    }
}
