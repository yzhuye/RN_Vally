import { Report } from "../entities/report";
import { ReportRepository } from "../repositories/report.repository";

export class GetStudentAverageReportsUseCase {
    constructor(private readonly repository: ReportRepository) {}
    async execute(params: { courseId: string; categoryId: string }): Promise<GetStudentAverageReportsResult> {
        try {
            const studentAverages = await this.repository.getStudentAverageReports(params.courseId, params.categoryId);
            return GetStudentAverageReportsResult.success('Reportes de promedio por estudiante obtenidos exitosamente', studentAverages);
        }
        catch (e) {
            return GetStudentAverageReportsResult.failure(`Error al obtener los reportes de promedio por estudiante: ${e}`);
        }
    }
}

export class GetStudentAverageReportsResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string,
        public readonly studentAverages: Report['studentAverages'] | null,
    ) {}
    static success(message: string, studentAverages: Report['studentAverages']): GetStudentAverageReportsResult {
        return new GetStudentAverageReportsResult(true, message, studentAverages);
    }
    static failure(message: string): GetStudentAverageReportsResult {
        return new GetStudentAverageReportsResult(false, message, null);
    }
}