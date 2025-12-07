import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ProfileSettingsPage implements OnInit {
  currentUser: any = null;
  userName: string = '';
  userEmail: string = '';

  // Form fields
  newName: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Loading states
  isUpdatingName: boolean = false;
  isChangingPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  /**
   * Load user profile from Firebase
   */
  loadUserProfile() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.userName = this.currentUser.displayName || 'User';
      this.userEmail = this.currentUser.email || '';
      this.newName = this.userName;
    }
  }

  /**
   * Update user display name
   */
  async updateDisplayName() {
    if (!this.newName || this.newName.trim() === '') {
      await this.showToast('Please enter a valid name', 'warning');
      return;
    }

    if (this.newName === this.userName) {
      await this.showToast('No changes detected', 'warning');
      return;
    }

    this.isUpdatingName = true;
    const result = await this.authService.updateUserProfile(this.newName);
    this.isUpdatingName = false;

    if (result.success) {
      await this.showToast('Name updated successfully!', 'success');
      this.userName = this.newName;
    } else {
      await this.showToast(result.error, 'danger');
    }
  }

  /**
   * Change user password
   */
  async changePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      await this.showToast('Please fill all password fields', 'warning');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      await this.showToast('New passwords do not match', 'warning');
      return;
    }

    if (this.newPassword.length < 6) {
      await this.showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    // Show confirmation alert
    const alert = await this.alertController.create({
      header: 'Change Password',
      message: 'Are you sure you want to change your password?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Change',
          handler: async () => {
            await this.performPasswordChange();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Perform password change
   */
  private async performPasswordChange() {
    this.isChangingPassword = true;

    try {
      // Re-authenticate user first
      const user = this.authService.getCurrentUser();
      if (!user || !user.email) {
        await this.showToast('User not found', 'danger');
        this.isChangingPassword = false;
        return;
      }

      // For now, we'll use the reset password email approach
      // Since Firebase requires re-authentication for password changes
      const result = await this.authService.resetPassword(user.email);
      
      if (result.success) {
        await this.showToast('Password reset email sent! Please check your inbox.', 'success');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      } else {
        await this.showToast(result.error, 'danger');
      }
    } catch (error: any) {
      await this.showToast('Failed to change password', 'danger');
    }

    this.isChangingPassword = false;
  }

  /**
   * Reset password via email
   */
  async resetPasswordViaEmail() {
    if (!this.userEmail) {
      await this.showToast('Email not found', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Reset Password',
      message: `Send password reset email to ${this.userEmail}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: async () => {
            this.isChangingPassword = true;
            const result = await this.authService.resetPassword(this.userEmail);
            this.isChangingPassword = false;

            if (result.success) {
              await this.showToast('Password reset email sent! Please check your inbox.', 'success');
            } else {
              await this.showToast(result.error, 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Delete account confirmation
   */
  async confirmDeleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      inputs: [
        {
          name: 'confirm',
          type: 'text',
          placeholder: 'Type DELETE to confirm'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: (data) => {
            if (data.confirm === 'DELETE') {
              this.deleteAccount();
            } else {
              this.showToast('Please type DELETE to confirm', 'warning');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Delete user account
   */
  private async deleteAccount() {
    // Note: This is a placeholder. Actual account deletion requires
    // Firebase Admin SDK or Cloud Functions
    await this.showToast('Account deletion feature is not yet implemented', 'warning');
  }

  /**
   * Navigate back to profile
   */
  goBack() {
    this.router.navigate(['/profile']);
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
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
