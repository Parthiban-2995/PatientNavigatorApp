import type { LoginPage } from '../pages/login/login.page';
import type { AppUser } from '../users/user.types';

export class AuthManager {
  constructor(private readonly loginPage: LoginPage) {}

  async login(user: AppUser): Promise<void> {
    await this.loginPage.navigateToLogin();
    await this.loginPage.login(user.username, user.password);
    await this.loginPage.verifySuccessfulLogin();
  }
}
