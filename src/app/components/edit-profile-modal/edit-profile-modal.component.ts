import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EditProfileModalComponent {
  @Input() userName: string = '';
  @Input() userEmail: string = '';

  newName: string = '';
  isLoading: boolean = false;

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.newName = this.userName;
  }

  async saveProfile() {
    if (!this.newName || this.newName.trim() === '') {
      await this.showToast('Please enter a valid name', 'warning');
      return;
    }

    if (this.newName === this.userName) {
      await this.showToast('No changes detected', 'warning');
      return;
    }

    this.isLoading = true;
    const result = await this.authService.updateUserProfile(this.newName);
    this.isLoading = false;

    if (result.success) {
      await this.showToast('Profile updated successfully!', 'success');
      this.modalController.dismiss({ updated: true });
    } else {
      await this.showToast(result.error, 'danger');
    }
  }

  cancel() {
    this.modalController.dismiss({ updated: false });
  }

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
