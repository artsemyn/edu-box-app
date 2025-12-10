import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CustomPatternService, CustomAnimation } from '../services/custom-pattern.service';

@Component({
  selector: 'app-discuss',
  templateUrl: './discuss.page.html',
  styleUrls: ['./discuss.page.scss'],
  standalone: false
})
export class DiscussPage implements OnInit, OnDestroy {
  // Community animations
  communityAnimations: CustomAnimation[] = [];
  isLoading: boolean = false;
  
  // Preview state
  previewAnimation: CustomAnimation | null = null;
  previewLedGrid: boolean[] = new Array(36).fill(false);
  previewFrameIndex: number = 0;
  previewIntervalId: any = null;
  isPreviewPlaying: boolean = false;

  constructor(
    private customPatternService: CustomPatternService,
    private auth: Auth,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadCommunityAnimations();
  }

  ngOnDestroy() {
    this.stopPreview();
  }

  /**
   * Load community animations from Firebase
   */
  async loadCommunityAnimations() {
    this.isLoading = true;
    try {
      this.communityAnimations = await this.customPatternService.getCommunityAnimations();
      // Sort by creation date (newest first)
      this.communityAnimations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      console.error('Error loading community animations:', error);
      await this.showToast('Error memuat animasi komunitas', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Preview animation
   */
  previewAnimationPattern(animation: CustomAnimation) {
    if (this.previewAnimation?.id === animation.id) {
      // Toggle off if same animation
      this.stopPreview();
      this.previewAnimation = null;
    } else {
      this.previewAnimation = animation;
      this.startPreview(animation);
    }
  }

  /**
   * Start preview animation
   */
  private startPreview(animation: CustomAnimation) {
    this.stopPreview();
    
    if (!animation.frames || animation.frames.length === 0) {
      return;
    }

    this.previewFrameIndex = 0;
    this.isPreviewPlaying = true;

    this.previewIntervalId = setInterval(() => {
      if (animation.frames[this.previewFrameIndex]) {
        this.previewLedGrid = [...animation.frames[this.previewFrameIndex]];
      }
      this.previewFrameIndex = (this.previewFrameIndex + 1) % animation.frames.length;
    }, animation.frameRate || 150);
  }

  /**
   * Stop preview
   */
  stopPreview() {
    if (this.previewIntervalId) {
      clearInterval(this.previewIntervalId);
      this.previewIntervalId = null;
    }
    this.previewLedGrid.fill(false);
    this.previewFrameIndex = 0;
    this.isPreviewPlaying = false;
  }

  /**
   * Save community animation to user's collection
   */
  async useAnimation(animation: CustomAnimation) {
    const user = this.auth.currentUser;
    if (!user) {
      await this.showToast('Silakan login untuk menggunakan animasi', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Gunakan Animasi',
      message: `Apakah Anda ingin menyimpan animasi "${animation.name}" ke koleksi Anda?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Simpan',
          handler: async () => {
            try {
              await this.customPatternService.saveCommunityAnimationToUser(animation.id);
              await this.showToast(`Animasi "${animation.name}" berhasil disimpan!`, 'success');
            } catch (error: any) {
              console.error('Error saving animation:', error);
              await this.showToast(`Error: ${error.message}`, 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Format date
   */
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  /**
   * Check if animation is being previewed
   */
  isPreviewing(animation: CustomAnimation): boolean {
    return this.previewAnimation?.id === animation.id && this.isPreviewPlaying;
  }
}
