import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CustomPatternService, CustomAnimation } from '../services/custom-pattern.service';
import { CodeParserService } from '../services/code-parser.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.page.html',
  styleUrls: ['./code-editor.page.scss'],
  standalone: false
})
export class CodeEditorPage implements OnInit, OnDestroy {

  // Editor properties - JSON only
  editorContent: string = '';
  
  // LED Grid for preview (6x6 = 36 LEDs)
  ledGrid: boolean[] = new Array(36).fill(false);
  
  // Animation properties
  currentFrameIndex: number = 0;
  animationIntervalId: any = null;
  isPlaying: boolean = false;
  frameRate: number = 150;
  frames: boolean[][] = [];
  
  // UI state
  showPreview: boolean = true;
  patternName: string = 'My Custom Pattern';
  selectedTemplate: string = 'diagonal';
  
  // JSON Templates
  jsonTemplates: { [key: string]: { name: string; code: string } } = {
    diagonal: {
      name: 'Diagonal Pattern',
      code: `{
  "animationName": "Diagonal Pattern",
  "frameRate": 150,
  "frames": [
    {
      "frameIndex": 0,
      "matrix": [
        [1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1]
      ]
    },
    {
      "frameIndex": 1,
      "matrix": [
        [0, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0]
      ]
    },
    {
      "frameIndex": 2,
      "matrix": [
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    }
  ]
}`
    },
    checkerboard: {
      name: 'Checkerboard Pattern',
      code: `{
  "animationName": "Checkerboard Pattern",
  "frameRate": 200,
  "frames": [
    {
      "frameIndex": 0,
      "matrix": [
        [1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1]
      ]
    },
    {
      "frameIndex": 1,
      "matrix": [
        [0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0]
      ]
    }
  ]
}`
    },
    border: {
      name: 'Border Pattern',
      code: `{
  "animationName": "Border Pattern",
  "frameRate": 150,
  "frames": [
    {
      "frameIndex": 0,
      "matrix": [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1]
      ]
    },
    {
      "frameIndex": 1,
      "matrix": [
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    },
    {
      "frameIndex": 2,
      "matrix": [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    }
  ]
}`
    },
    spiral: {
      name: 'Spiral Pattern',
      code: `{
  "animationName": "Spiral Pattern",
  "frameRate": 180,
  "frames": [
    {
      "frameIndex": 0,
      "matrix": [
        [1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 1]
      ]
    },
    {
      "frameIndex": 1,
      "matrix": [
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 0]
      ]
    },
    {
      "frameIndex": 2,
      "matrix": [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0]
      ]
    },
    {
      "frameIndex": 3,
      "matrix": [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0]
      ]
    }
  ]
}`
    },
    blink: {
      name: 'Blink All',
      code: `{
  "animationName": "Blink All",
  "frameRate": 300,
  "frames": [
    {
      "frameIndex": 0,
      "matrix": [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1]
      ]
    },
    {
      "frameIndex": 1,
      "matrix": [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    }
  ]
}`
    },
    wave: {
      name: 'Wave Pattern',
      code: `{
  "animationName": "Wave Pattern",
  "frameRate": 120,
  "frames": [
    {
      "frameIndex": 0,
      "matrix": [
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    },
    {
      "frameIndex": 1,
      "matrix": [
        [0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    },
    {
      "frameIndex": 2,
      "matrix": [
        [0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    },
    {
      "frameIndex": 3,
      "matrix": [
        [0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    },
    {
      "frameIndex": 4,
      "matrix": [
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    },
    {
      "frameIndex": 5,
      "matrix": [
        [0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0]
      ]
    }
  ]
}`
    },
    blank: {
      name: 'Blank Template',
      code: `{
  "animationName": "My Custom Animation",
  "frameRate": 150,
  "frames": [
    {
      "frameIndex": 0,
      "matrix": [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
      ]
    }
  ]
}`
    }
  };

  // Default JSON template (uses diagonal as default)
  get defaultJsonTemplate(): string {
    return this.jsonTemplates[this.selectedTemplate].code;
  }

  constructor(
    private customPatternService: CustomPatternService,
    private codeParserService: CodeParserService,
    private auth: Auth,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Load default template
    this.loadTemplate(this.selectedTemplate);
    // Parse initial content
    setTimeout(() => {
      this.parseAndPreview();
    }, 100);
  }

  /**
   * Load a template into the editor
   */
  loadTemplate(templateKey: string) {
    if (this.jsonTemplates[templateKey]) {
      const template = this.jsonTemplates[templateKey];
      this.selectedTemplate = templateKey;
      this.editorContent = template.code;
      
      // Extract animation name
      try {
        const data = JSON.parse(template.code);
        if (data.animationName) {
          this.patternName = data.animationName;
        }
      } catch {}
      
      // Parse and preview
      this.parseAndPreview();
    }
  }

  /**
   * Get template keys for dropdown
   */
  get templateKeys(): string[] {
    return Object.keys(this.jsonTemplates);
  }

  /**
   * Get template name by key
   */
  getTemplateName(key: string): string {
    return this.jsonTemplates[key]?.name || key;
  }

  ngOnDestroy() {
    this.stopAnimation();
  }

  /**
   * Handle textarea input changes
   */
  onEditorChange() {
    this.parseAndPreview();
  }

  /**
   * Parse code and update preview
   */
  parseAndPreview() {
    try {
      const parsed = this.codeParserService.parseJsonCode(this.editorContent);
      
      if (parsed.isValid && parsed.frames.length > 0) {
        this.frames = parsed.frames;
        this.frameRate = parsed.frameRate;
        
        // Display first frame
        this.displayFrame(0);
        
        // Extract animation name if available
        try {
          const data = JSON.parse(this.editorContent);
          if (data.animationName) {
            this.patternName = data.animationName;
          }
        } catch {}
      } else {
        // Invalid code - show error or empty grid
        this.ledGrid = new Array(36).fill(false);
        this.frames = [];
      }
    } catch (error) {
      console.error('Parse error:', error);
      this.ledGrid = new Array(36).fill(false);
      this.frames = [];
    }
  }

  /**
   * Display a specific frame
   */
  private displayFrame(index: number) {
    if (this.frames[index] && this.frames[index].length === 36) {
      this.ledGrid = [...this.frames[index]];
    }
  }

  /**
   * Play animation
   */
  playAnimation() {
    if (this.frames.length === 0) return;
    
    this.isPlaying = true;
    this.currentFrameIndex = 0;
    
    this.animationIntervalId = setInterval(() => {
      this.displayFrame(this.currentFrameIndex);
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    }, this.frameRate);
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
    if (this.frames.length > 0) {
      this.displayFrame(0);
    }
  }

  /**
   * Step forward one frame
   */
  stepForward() {
    if (this.frames.length === 0) return;
    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
    this.displayFrame(this.currentFrameIndex);
  }

  /**
   * Step backward one frame
   */
  stepBackward() {
    if (this.frames.length === 0) return;
    this.currentFrameIndex = (this.currentFrameIndex - 1 + this.frames.length) % this.frames.length;
    this.displayFrame(this.currentFrameIndex);
  }

  /**
   * Toggle preview visibility (mobile)
   */
  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  /**
   * Format JSON code
   */
  formatCode() {
    try {
      // Parse and format JSON with 2-space indentation
      const parsed = JSON.parse(this.editorContent);
      const formatted = JSON.stringify(parsed, null, 2);

      // Update editor content (textarea will update automatically via ngModel)
      this.editorContent = formatted;
      this.parseAndPreview();

      this.showToast('Code formatted successfully!', 'success');
    } catch (error) {
      // If JSON is invalid, try to auto-fix common issues
      try {
        let fixedJson = this.editorContent
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/(\w+):/g, '"$1":'); // Quote unquoted keys

        const parsed = JSON.parse(fixedJson);
        const formatted = JSON.stringify(parsed, null, 2);

        // Update editor content (textarea will update automatically via ngModel)
        this.editorContent = formatted;
        this.parseAndPreview();

        this.showToast('Code auto-fixed and formatted!', 'success');
      } catch (innerError) {
        this.showToast('Cannot format: Invalid JSON syntax', 'danger');
      }
    }
  }

  /**
   * Save animation to user's collection (for "Save" button)
   * Saves to /users/{userId}/animations/ and shows in Control page "My Animations" tab
   */
  async saveAnimation() {
    // Validate code first
    const validation = this.codeParserService.validateJsonCode(this.editorContent);
    if (!validation.isValid) {
      await this.showToast(`Validation Error: ${validation.error}`, 'danger');
      return;
    }

    // Parse to get frames
    const parsed = this.codeParserService.parseJsonCode(this.editorContent);
    if (!parsed.isValid || parsed.frames.length === 0) {
      await this.showToast('Invalid animation code. Please check your JSON.', 'danger');
      return;
    }

    // Show name input dialog
    const alert = await this.alertController.create({
      header: 'Simpan Animasi',
      message: 'Masukkan nama untuk animasi custom Anda:',
      inputs: [
        {
          name: 'animationName',
          type: 'text',
          placeholder: 'Nama Animasi',
          value: this.patternName
        }
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Simpan',
          handler: async (data) => {
            if (!data.animationName || data.animationName.trim() === '') {
              await this.showToast('Mohon masukkan nama animasi', 'warning');
              return false;
            }
            await this.performSave(data.animationName.trim(), parsed);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Perform the actual save operation
   */
  private async performSave(name: string, parsed: any) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        await this.showToast('Silakan login untuk menyimpan animasi', 'warning');
        return;
      }

      const animationData = {
        name: name,
        code: this.editorContent,
        codeType: 'json' as const,
        frames: parsed.frames,
        frameRate: parsed.frameRate,
        isShared: false
      };

      const animationId = await this.customPatternService.saveUserAnimation(animationData);
      await this.showToast(`Animasi "${name}" berhasil disimpan!`, 'success');
      
      // Update pattern name
      this.patternName = name;
    } catch (error: any) {
      console.error('Save error:', error);
      await this.showToast(`Error menyimpan animasi: ${error.message}`, 'danger');
    }
  }

  /**
   * Share animation to community (for "Share" button)
   * Saves to /discuss/animations/ for community page
   */
  async shareAnimation() {
    // Validate code first
    const validation = this.codeParserService.validateJsonCode(this.editorContent);
    if (!validation.isValid) {
      await this.showToast(`Validation Error: ${validation.error}`, 'danger');
      return;
    }

    // Parse to get frames
    const parsed = this.codeParserService.parseJsonCode(this.editorContent);
    if (!parsed.isValid || parsed.frames.length === 0) {
      await this.showToast('Invalid animation code. Please check your JSON.', 'danger');
      return;
    }

    // Check if already saved
    const alert = await this.alertController.create({
      header: 'Bagikan ke Komunitas',
      message: 'Animasi akan dibagikan ke halaman Discuss. Pastikan animasi sudah disimpan terlebih dahulu.',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Bagikan',
          handler: async () => {
            await this.performShare(parsed);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Perform the actual share operation
   */
  private async performShare(parsed: any) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        await this.showToast('Silakan login untuk membagikan animasi', 'warning');
        return;
      }

      // First save to user's collection if not already saved
      const animationData = {
        name: this.patternName,
        code: this.editorContent,
        codeType: 'json' as const,
        frames: parsed.frames,
        frameRate: parsed.frameRate,
        isShared: false
      };

      const animationId = await this.customPatternService.saveUserAnimation(animationData);
      
      // Then share to community
      await this.customPatternService.shareToCommunity(animationId);
      await this.showToast(`Animasi "${this.patternName}" berhasil dibagikan ke komunitas!`, 'success');
    } catch (error: any) {
      console.error('Share error:', error);
      await this.showToast(`Error membagikan animasi: ${error.message}`, 'danger');
    }
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
