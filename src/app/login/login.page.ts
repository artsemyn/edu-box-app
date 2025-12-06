import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async login() {
    if (!this.email || !this.password) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    this.isLoading = true;
    const result = await this.authService.login(this.email, this.password);
    this.isLoading = false;

    if (result.success) {
      await this.showToast('Login successful!', 'success');
      this.router.navigate(['/home']);
    } else {
      await this.showToast(result.error, 'danger');
    }
  }

  async loginWithGoogle() {
    this.isLoading = true;
    const result = await this.authService.loginWithGoogle();
    this.isLoading = false;

    if (result.success) {
      await this.showToast('Login successful!', 'success');
      this.router.navigate(['/home']);
    } else {
      await this.showToast(result.error, 'danger');
    }
  }

  async forgotPassword() {
    if (!this.email) {
      await this.showToast('Please enter your email address', 'warning');
      return;
    }

    const result = await this.authService.resetPassword(this.email);
    if (result.success) {
      await this.showToast('Password reset email sent! Check your inbox.', 'success');
    } else {
      await this.showToast(result.error, 'danger');
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
