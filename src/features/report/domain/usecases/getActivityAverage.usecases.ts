import { Report } from "../entities/report";
import { ReportRepository } from "../repositories/report.repository";

export class GetActivityAverageReportUseCase {
    constructor(private readonly repository: ReportRepository) {}

    async execute(params: { courseId: string; categoryId: string }): Promise<GetActivityAverageReportResult> {
        try {
            const activityAverage = await this.repository.getActivityAverageReport(params.courseId, params.categoryId);
            return GetActivityAverageReportResult.success('Reporte de promedio de actividades obtenido exitosamente', activityAverage);
        }
        catch (e) {
            return GetActivityAverageReportResult.failure(`Error al obtener el reporte de promedio de actividades: ${e}`);
        }
    }
}

export class GetActivityAverageReportResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string,
        public readonly activityAverage: Report['activityAverage'] | null,
    ) {}
    static success(message: string, activityAverage: Report['activityAverage']): GetActivityAverageReportResult {
        return new GetActivityAverageReportResult(true, message, activityAverage);
    }
    static failure(message: string): GetActivityAverageReportResult {
        return new GetActivityAverageReportResult(false, message, null);
    }
}