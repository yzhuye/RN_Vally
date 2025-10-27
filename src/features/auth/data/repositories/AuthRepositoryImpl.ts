import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthRemoteDataSource } from "../datasources/AuthRemoteDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  private dataSource: AuthRemoteDataSource;

  constructor(dataSource: AuthRemoteDataSource) {
    this.dataSource = dataSource;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    await this.dataSource.login(email, password);
    // After successful login, return a user object
    // In a real app, you might want to fetch user details from the backend
    return { email, password: "" }; // Don't store password in the user object
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    await this.dataSource.signUp(email, password);
    // After successful signup, return a user object
    return { email, password: "" }; // Don't store password in the user object
  }

  async logout(): Promise<void> {
    return this.dataSource.logOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
   // return this.dataSource.getCurrentUser();
    return null;
  }
}
