import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class SignupPage {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async signup() {
    // Validation
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showToast('Passwords do not match', 'warning');
      return;
    }

    if (this.password.length < 6) {
      await this.showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    this.isLoading = true;
    const result = await this.authService.signUp(this.email, this.password, this.name);
    this.isLoading = false;

    if (result.success) {
      await this.showToast('Account created successfully!', 'success');
      this.router.navigate(['/home']);
    } else {
      await this.showToast(result.error, 'danger');
    }
  }

  async signupWithGoogle() {
    this.isLoading = true;
    const result = await this.authService.loginWithGoogle();
    this.isLoading = false;

    if (result.success) {
      await this.showToast('Account created successfully!', 'success');
      this.router.navigate(['/home']);
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
