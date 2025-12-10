import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ProfilePage implements OnInit {
  currentUser: any = null;
  userName: string = '';
  userEmail: string = '';
  userPhotoURL: string = '';
  memberSince: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalController: ModalController
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
      this.userPhotoURL = this.currentUser.photoURL || '';
      
      // Get member since date
      if (this.currentUser.metadata?.creationTime) {
        const createdDate = new Date(this.currentUser.metadata.creationTime);
        this.memberSince = createdDate.toLocaleDateString('id-ID', { 
          year: 'numeric', 
          month: 'long'
        });
      }
    }
  }

  /**
   * Navigate to profile settings
   */
  navigateToSettings() {
    this.router.navigate(['/profile-settings']);
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
}
