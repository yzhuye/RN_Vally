export class Report {
  constructor(
    public readonly categoryId: string,
    public readonly categoryName: string,
    public readonly activityAverage: ActivityAverageReport,
    public readonly groupAverages: GroupAverageReport[],
    public readonly studentAverages: StudentAverageReport[],
    public readonly detailedResults: DetailedResultReport[],
  ) {}
}

export class ActivityAverageReport {
  constructor(
    public readonly overallAverage: number,
    public readonly punctualityAverage: number,
    public readonly contributionsAverage: number,
    public readonly commitmentAverage: number,
    public readonly attitudeAverage: number,
    public readonly totalActivities: number,
    public readonly totalEvaluations: number,
  ) {}
}

export class GroupAverageReport {
    constructor(
        public readonly groupId: string,
        public readonly groupName: string,
        public readonly overallAverage: number,
        public readonly punctualityAverage: number,
        public readonly contributionsAverage: number,
        public readonly commitmentAverage: number,
        public readonly attitudeAverage: number,
        public readonly totalStudents: number,
        public readonly totalEvaluations: number,
    ) {}
}

export class StudentAverageReport {
    constructor(
        public readonly studentId: string,
        public readonly studentName: string,
        public readonly overallAverage: number,
        public readonly punctualityAverage: number,
        public readonly contributionsAverage: number,
        public readonly commitmentAverage: number,
        public readonly attitudeAverage: number,
        public readonly groupId: string,
        public readonly groupName: string,
        public readonly totalEvaluations: number,
    ) {}
}

export class DetailedResultReport {
    constructor(
        public readonly groupId: string,
        public readonly groupName: string,
        public readonly students: StudentDetailedResult[],
    ) {}
}

export class StudentDetailedResult {
    constructor(
        public readonly studentId: string,
        public readonly studentName: string,
        public readonly criteriaScores: CriteriaScore[],
        public readonly overallAverage: number,
    ) {}
}

export class CriteriaScore {
    constructor(
        public readonly criteriaName: string,
        public readonly averageScore: number,
        public readonly totalEvaluations: number,
        public readonly individualEvaluations: IndividualEvaluation[],
    ) {}
}
export class IndividualEvaluation {
    constructor(
        public readonly evaluatorId: string,
        public readonly evaluatorName: string,
        public readonly score: number,
        public readonly createdAt: Date,
        public readonly activityId: string,
        public readonly activityName: string,
    ) {}
}