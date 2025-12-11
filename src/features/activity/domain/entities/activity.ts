export class Activity {
    constructor(
        public readonly id: string,
        public name: string,
        public description: string,
        public dueDate: Date,
        public categoryId: string,
        public evaluations: string[] = []
    ) {}
}