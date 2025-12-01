export class Evaluation {
    constructor(
        public readonly id: string,
        public activityId: string,
        public evaluatorId: string, // ID of the student who evaluates
        public evaluatedId: string, // ID of the evaluated student
        public punctuality: number, // 0-5 stars - Punctuality
        public contributions: number, // 0-5 stars - Contributions
        public commitment: number, // 0-5 stars - Commitment
        public attitude: number, // 0-5 stars - Attitude
        public createdAt: Date,
    ) { }

    get isValid(): boolean {
        return this._isValidMetric(this.punctuality) &&
            this._isValidMetric(this.contributions) &&
            this._isValidMetric(this.commitment) &&
            this._isValidMetric(this.attitude);
    }

    private _isValidMetric(metric: number): boolean {
        return metric >= 0 && metric <= 5;
    }

    get averageRating(): number {
        return (this.punctuality + this.contributions + this.commitment + this.attitude) / 4.0;
    }
}