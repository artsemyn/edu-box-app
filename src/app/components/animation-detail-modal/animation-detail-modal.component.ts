import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CustomPatternService, CustomAnimation } from '../../services/custom-pattern.service';

@Component({
  selector: 'app-animation-detail-modal',
  templateUrl: './animation-detail-modal.component.html',
  styleUrls: ['./animation-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AnimationDetailModalComponent implements OnInit, OnDestroy {
  @Input() animation!: CustomAnimation;

  ledGrid: boolean[] = new Array(36).fill(false);
  currentFrameIndex: number = 0;
  animationIntervalId: any = null;
  isPlaying: boolean = false;
  showCode: boolean = false;

  constructor(
    private modalController: ModalController,
    private customPatternService: CustomPatternService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    if (this.animation && this.animation.frames && this.animation.frames.length > 0) {
      this.displayFrame(0);
    }
  }

  ngOnDestroy() {
    this.stopAnimation();
  }

  /**
   * Display a specific frame
   */
  private displayFrame(index: number) {
    if (this.animation.frames && this.animation.frames[index] && this.animation.frames[index].length === 36) {
      this.ledGrid = [...this.animation.frames[index]];
      this.currentFrameIndex = index;
    }
  }

  /**
   * Play animation
   */
  playAnimation() {
    if (!this.animation.frames || this.animation.frames.length === 0) return;
    
    this.isPlaying = true;
    this.currentFrameIndex = 0;
    
    const frameRate = this.animation.frameRate || 150;
    this.animationIntervalId = setInterval(() => {
      this.displayFrame(this.currentFrameIndex);
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.animation.frames!.length;
    }, frameRate);
  }

  /**
   * Pause animation
   */
  pauseAnimation() {
    this.isPlaying = false;
    if (this.animationIntervalId) {
      clearInterval(this.animationIntervalId);
      this.animationIntervalId = null;
    }
  }

  /**
   * Stop animation
   */
  stopAnimation() {
    this.pauseAnimation();
    this.currentFrameIndex = 0;
    if (this.animation.frames && this.animation.frames.length > 0) {
      this.displayFrame(0);
    }
  }

  /**
   * Step forward one frame
   */
  stepForward() {
    if (!this.animation.frames || this.animation.frames.length === 0) return;
    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.animation.frames.length;
    this.displayFrame(this.currentFrameIndex);
  }

  /**
   * Step backward one frame
   */
  stepBackward() {
    if (!this.animation.frames || this.animation.frames.length === 0) return;
    this.currentFrameIndex = (this.currentFrameIndex - 1 + this.animation.frames.length) % this.animation.frames.length;
    this.displayFrame(this.currentFrameIndex);
  }

  /**
   * Toggle code view
   */
  toggleCodeView() {
    this.showCode = !this.showCode;
  }

  /**
   * Use animation (save to user's collection)
   */
  async useAnimation() {
    try {
      await this.customPatternService.saveCommunityAnimationToUser(this.animation.id);
      await this.showToast(`"${this.animation.name}" saved to your collection!`, 'success');
      this.modalController.dismiss({ used: true });
    } catch (error: any) {
      console.error('Error using animation:', error);
      await this.showToast(`Error: ${error.message}`, 'danger');
    }
  }

  /**
   * Close modal
   */
  close() {
    this.modalController.dismiss({ used: false });
  }

  /**
   * Format date
   */
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
}

