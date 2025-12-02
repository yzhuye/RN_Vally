import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthRemoteDataSource } from "../datasources/AuthRemoteDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  private dataSource: AuthRemoteDataSource;

  constructor(dataSource: AuthRemoteDataSource) {
    this.dataSource = dataSource;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    return this.dataSource.login(email, password);
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    await this.dataSource.signUp(email, password);
    
    // For signup, return a basic user object since the backend might not store username yet
    return { 
      id: "",
      email, 
      password: "", 
      username: email.split("@")[0]
    };
  }

  async logout(): Promise<void> {
    return this.dataSource.logOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.dataSource.getCurrentUser();
  }

  async getUserIdByEmail(email: string): Promise<string | null> {
    return this.dataSource.getUserIdByEmail(email);
  }
}
