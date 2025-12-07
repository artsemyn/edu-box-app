import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CodeValidationService } from '../../services/code-validation.service';
import { AnimationPattern } from '../../services/animation-pattern.service';

@Component({
  selector: 'app-code-input-modal',
  templateUrl: './code-input-modal.component.html',
  styleUrls: ['./code-input-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CodeInputModalComponent implements OnInit {
  @Input() animationPattern?: AnimationPattern;
  
  code: string = '';
  jsonCode: string = '';
  isLoading: boolean = false;
  attempts: number = 0;
  maxAttempts: number = 5;
  isLocked: boolean = false;

  constructor(
    private modalController: ModalController,
    private codeValidationService: CodeValidationService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Always show modal to input JSON code for learning purposes
    // Remove auto-dismiss to ensure user always inputs code
  }

  /**
   * Validate and submit JSON code
   */
  async validateCode() {
    // If animation pattern is provided, validate JSON code
    if (this.animationPattern?.jsonCode) {
      await this.validateJsonCode();
      return;
    }

    // Legacy: Validate text code
    if (!this.code || this.code.trim() === '') {
      await this.showToast('Mohon masukkan kode', 'warning');
      return;
    }

    if (this.isLocked) {
      await this.showToast('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.', 'danger');
      return;
    }

    this.isLoading = true;
    await new Promise(resolve => setTimeout(resolve, 500));

    const isValid = this.codeValidationService.validateCode(this.code);
    this.isLoading = false;

    if (isValid) {
      await this.showToast('Kode berhasil divalidasi!', 'success');
      this.dismissWithSuccess();
    } else {
      this.handleValidationFailure();
    }
  }

  /**
   * Validate JSON code for animation
   */
  private async validateJsonCode() {
    const codeToValidate = this.jsonCode.trim();
    
    if (!codeToValidate) {
      await this.showToast('Mohon masukkan kode JSON', 'warning');
      return;
    }

    if (this.isLocked) {
      await this.showToast('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.', 'danger');
      return;
    }

    // Validate JSON format first
    let parsedJson;
    try {
      parsedJson = JSON.parse(codeToValidate);
      console.log('Parsed JSON:', parsedJson);
    } catch (error) {
      console.error('Invalid JSON format:', error);
      await this.showToast('Format JSON tidak valid. Periksa kembali kode Anda.', 'danger');
      return;
    }

    // Validate that it has required fields
    if (!parsedJson.animation || !parsedJson.type) {
      await this.showToast('JSON code harus memiliki field "animation" dan "type"', 'danger');
      return;
    }

    this.isLoading = true;
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate against expected JSON code
    const isValid = this.codeValidationService.validateAndSaveAnimationCode(
      codeToValidate,
      this.animationPattern!.id,
      this.animationPattern!.jsonCode!
    );

    this.isLoading = false;

    if (isValid) {
      console.log('JSON code validated successfully for animation:', this.animationPattern!.name);
      await this.showToast('Kode JSON berhasil divalidasi! Mengirim perintah ke Firebase...', 'success');
      this.dismissWithSuccess();
    } else {
      console.warn('JSON code validation failed. Expected:', this.animationPattern!.jsonCode, 'Got:', codeToValidate);
      this.handleValidationFailure();
    }
  }

  /**
   * Handle validation failure
   */
  private async handleValidationFailure() {
    this.attempts++;
    if (this.attempts >= this.maxAttempts) {
      this.isLocked = true;
      await this.showToast(`Terlalu banyak percobaan gagal. Silakan coba lagi dalam 30 detik.`, 'danger');
      setTimeout(() => {
        this.isLocked = false;
        this.attempts = 0;
      }, 30000);
    } else {
      const remaining = this.maxAttempts - this.attempts;
      await this.showToast(`Kode tidak valid. Tersisa ${remaining} percobaan.`, 'danger');
      this.code = '';
      this.jsonCode = '';
    }
  }

  /**
   * Dismiss modal with success
   */
  dismissWithSuccess() {
    this.modalController.dismiss({ validated: true });
  }

  /**
   * Cancel/Dismiss modal
   */
  cancel() {
    this.modalController.dismiss({ validated: false });
  }

  /**
   * Handle Enter key press
   */
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.isLoading && !this.isLocked) {
      this.validateCode();
    }
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
