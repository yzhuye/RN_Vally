import { Report } from "../entities/report";
import { ReportRepository } from "../repositories/report.repository";

export class GetGroupAverageReportsUseCase {
    constructor(private readonly repository: ReportRepository) {}
    async execute(params: { courseId: string; categoryId: string }): Promise<GetGroupAverageReportsResult> {
        try {
            const groupAverages = await this.repository.getGroupAverageReports(params.courseId, params.categoryId);
            return GetGroupAverageReportsResult.success('Reportes de promedio por grupo obtenidos exitosamente', groupAverages);
        }
        catch (e) {
            return GetGroupAverageReportsResult.failure(`Error al obtener los reportes de promedio por grupo: ${e}`);
        }
    }
}

export class GetGroupAverageReportsResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string,
        public readonly groupAverages: Report['groupAverages'] | null,
    ) {}
    static success(message: string, groupAverages: Report['groupAverages']): GetGroupAverageReportsResult {
        return new GetGroupAverageReportsResult(true, message, groupAverages);
    }
    static failure(message: string): GetGroupAverageReportsResult {
        return new GetGroupAverageReportsResult(false, message, null);
    }
}