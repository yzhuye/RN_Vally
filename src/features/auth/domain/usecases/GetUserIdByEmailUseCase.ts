import { AuthRepository } from "../repositories/AuthRepository";

export class GetUserIdByEmailUseCase {
  private repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async execute(email: string): Promise<string | null> {
    return this.repository.getUserIdByEmail(email);
  }
}
