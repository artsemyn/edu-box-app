import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class SettingsPage implements OnInit {
  // Bluetooth connection properties
  bluetoothStatus: 'Disconnected' | 'Scanning' | 'Connected' = 'Disconnected';
  statusMessage = 'No device found nearby.';

  // User profile properties
  currentUser: any = null;
  userName: string = '';
  userEmail: string = '';

  // Dark mode property
  isDarkMode: boolean = false;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private modalController: ModalController
  ) {
    this.isDarkMode = this.themeService.isDarkMode();
  }

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
    }
  }

  /**
   * Start Bluetooth pairing (mock simulation)
   */
  startPairing() {
    if (this.bluetoothStatus === 'Scanning') return;

    this.bluetoothStatus = 'Scanning';
    this.statusMessage = 'Scanning for devices... Please wait...';

    setTimeout(() => {
      const success = Math.random() > 0.5;

      if (success) {
        this.bluetoothStatus = 'Connected';
        this.statusMessage = 'Device "MyLightHub" connected successfully.';
      } else {
        this.bluetoothStatus = 'Disconnected';
        this.statusMessage = 'Pairing failed. No device found nearby.';
      }
    }, 4000);
  }

  /**
   * Open edit profile modal
   */
  async editProfile() {
    const { EditProfileModalComponent } = await import('../components/edit-profile-modal/edit-profile-modal.component');

    const modal = await this.modalController.create({
      component: EditProfileModalComponent,
      componentProps: {
        userName: this.userName,
        userEmail: this.userEmail
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.updated) {
        this.loadUserProfile();
      }
    });

    return await modal.present();
  }

  /**
   * Logout user
   */
  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Toggle dark mode on/off
   */
  toggleDarkMode(event: any): void {
    const isEnabled = event.detail.checked;
    this.isDarkMode = isEnabled;
    this.themeService.setDarkMode(isEnabled);
  }
}
