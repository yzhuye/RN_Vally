import { Report } from "../entities/report";
import { ReportRepository } from "../repositories/report.repository";

export class GetDetailedResultReportsUseCase {
    constructor(private readonly repository: ReportRepository) {}

    async execute(params: { courseId: string; categoryId: string }): Promise<GetDetailedResultReportsResult> {
        try {
            const detailedResults = await this.repository.getDetailedResultReports(params.courseId, params.categoryId);
            return GetDetailedResultReportsResult.success('Reportes detallados obtenidos exitosamente', detailedResults);
        }
        catch (e) {
            return GetDetailedResultReportsResult.failure(`Error al obtener los reportes detallados: ${e}`);
        }
    }
}

export class GetDetailedResultReportsResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string,
        public readonly detailedResults: Report['detailedResults'] | null,
    ) {}
    static success(message: string, detailedResults: Report['detailedResults']): GetDetailedResultReportsResult {
        return new GetDetailedResultReportsResult(true, message, detailedResults);
    }
    static failure(message: string): GetDetailedResultReportsResult {
        return new GetDetailedResultReportsResult(false, message, null);
    }
}