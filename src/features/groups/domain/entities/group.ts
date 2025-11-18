export class Group {
  constructor(
    public readonly _id: string,
    public name: string,
    public maxCapacity: number,
    public currentCapacity: number,
    public members: string[],
    public categoryId: string,
  ) {}
}
