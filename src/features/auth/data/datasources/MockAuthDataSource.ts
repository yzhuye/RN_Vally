import { AuthRemoteDataSource } from "./AuthRemoteDataSource";

/**
 * Mock implementation of AuthRemoteDataSource for local development
 * No backend connection required
 */
export class MockAuthDataSource implements AuthRemoteDataSource {
  async login(email: string, password: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Just log for debugging
    console.log("Mock login successful:", email);
    return Promise.resolve();
  }

  async signUp(email: string, password: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("Mock signup successful:", email);
    return Promise.resolve();
  }

  async logOut(): Promise<void> {
    console.log("Mock logout successful");
    return Promise.resolve();
  }

  async validate(email: string, validationCode: string): Promise<boolean> {
    return true;
  }

  async refreshToken(): Promise<boolean> {
    return true;
  }

  async forgotPassword(email: string): Promise<boolean> {
    return true;
  }

  async resetPassword(
    email: string,
    newPassword: string,
    validationCode: string
  ): Promise<boolean> {
    return true;
  }

  async verifyToken(): Promise<boolean> {
    return true;
  }
}
