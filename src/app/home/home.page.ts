import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AnimationPatternService, AnimationPattern } from '../services/animation-pattern.service';
import { LedControlService } from '../services/led-control.service';
import { CustomPatternService, CustomAnimation } from '../services/custom-pattern.service';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ]
})
export class HomePage implements OnInit, OnDestroy {
  // LED Grid for display (6x6 = 36 LEDs)
  ledGrid: boolean[] = new Array(36).fill(false);

  // Animation properties
  selectedPattern: AnimationPattern | CustomAnimation | null = null;
  currentFrameIndex: number = 0;
  animationIntervalId: any = null;
  patterns: AnimationPattern[] = [];
  customAnimations: CustomAnimation[] = [];
  
  // Tab state
  activeTab: 'default' | 'my-animations' = 'default';

  // Theme properties
  headerIcon: string = 'cube';
  themeName: string = 'EDUBOX';

  // Firebase connection status
  isConnected: boolean = false;
  currentAnimationNumber: number | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private animationPatternService: AnimationPatternService,
    private ledControlService: LedControlService,
    private customPatternService: CustomPatternService,
    private auth: Auth,
    private toastController: ToastController
  ) {
    // Theme is always EDUBOX
    this.headerIcon = 'cube';
    this.themeName = 'EDUBOX';

    // Load patterns from service
    this.patterns = this.animationPatternService.getPatterns();
  }

  async ngOnInit() {
    // Initialize Firebase connection
    try {
      await this.ledControlService.initializeConnection();
    } catch (error) {
      console.error('Failed to initialize Firebase connection:', error);
    }

    // Load user's custom animations
    await this.loadCustomAnimations();

    // Subscribe to connection status
    const connectionSub = this.ledControlService.connectionStatus$.subscribe(
      (connected) => {
        this.isConnected = connected;
      }
    );
    this.subscriptions.push(connectionSub);

    // Subscribe to current animation changes
    const animationSub = this.ledControlService.currentAnimation$.subscribe(
      (animNumber) => {
        this.currentAnimationNumber = animNumber;
        // Update selected pattern based on Firebase state
        if (animNumber === null || animNumber === 0) {
          this.selectedPattern = null;
          this.stopAnimation();
        } else {
          // Find pattern matching animation number
          const matchingPattern = this.patterns.find(p => p.animNumber === animNumber);
          if (matchingPattern) {
            this.selectedPattern = matchingPattern;
            // Keep local preview running
            if (!this.animationIntervalId) {
              this.startAnimation(matchingPattern);
            }
          }
        }
      }
    );
    this.subscriptions.push(animationSub);
  }

  /**
   * Load user's custom animations from Firebase
   */
  async loadCustomAnimations() {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      this.customAnimations = await this.customPatternService.getUserAnimations(user.uid);
    } catch (error) {
      console.error('Error loading custom animations:', error);
    }
  }

  /**
   * Switch between Default and My Animations tabs
   */
  switchTab(tab: string | number | undefined) {
    if (!tab || typeof tab !== 'string') return;
    if (tab !== 'default' && tab !== 'my-animations') return;
    this.activeTab = tab as 'default' | 'my-animations';
    // Stop current animation when switching tabs
    this.stopAnimation();
    this.selectedPattern = null;
  }

  /**
   * Get current patterns list based on active tab
   */
  get currentPatterns(): (AnimationPattern | CustomAnimation)[] {
    if (this.activeTab === 'default') {
      return this.patterns;
    } else {
      return this.customAnimations;
    }
  }

  ngOnDestroy() {
    // Stop animation when leaving page to prevent memory leaks
    this.stopAnimation();
    // Unsubscribe from observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Select and play an animation pattern
   * @param pattern The pattern to play (can be AnimationPattern or CustomAnimation)
   */
  async selectPattern(pattern: AnimationPattern | CustomAnimation) {
    if (this.selectedPattern?.id === pattern.id) {
      // Toggle off if same pattern - send stop command to Firebase
      await this.ledControlService.stopAnimation();
      this.selectedPattern = null;
      this.stopAnimation();
    } else {
      // Check if it's a custom animation or default pattern
      if ('animNumber' in pattern && pattern.animNumber !== undefined) {
        // Default pattern - play directly
        console.log('Playing default animation:', pattern.name);
        try {
          await this.ledControlService.setAnimation(pattern.animNumber, pattern as AnimationPattern);
          console.log('Animation command sent to Firebase successfully');
          this.selectedPattern = pattern;
          // Start local preview
          this.startAnimation(pattern as AnimationPattern);
        } catch (error) {
          console.error('Error setting animation:', error);
        }
      } else {
        // Custom animation - preview only (no Firebase control for custom patterns yet)
        console.log('Playing custom animation:', pattern.name);
        this.selectedPattern = pattern;
        this.startCustomAnimation(pattern as CustomAnimation);
      }
    }
  }


  /**
   * Start playing an animation pattern
   * @param pattern The pattern to animate
   */
  private startAnimation(pattern: AnimationPattern) {
    // Stop any existing animation first
    this.stopAnimation();

    // Reset frame counter
    this.currentFrameIndex = 0;

    // Start animation loop
    this.animationIntervalId = setInterval(() => {
      // Generate frame
      this.ledGrid = pattern.generateFrame(this.currentFrameIndex);

      // Increment frame counter
      this.currentFrameIndex++;
    }, pattern.frameRate);
  }

  /**
   * Start playing a custom animation
   * @param animation The custom animation to play
   */
  private startCustomAnimation(animation: CustomAnimation) {
    // Stop any existing animation first
    this.stopAnimation();

    if (!animation.frames || animation.frames.length === 0) {
      console.warn('Custom animation has no frames');
      return;
    }

    // Reset frame counter
    this.currentFrameIndex = 0;

    // Start animation loop
    this.animationIntervalId = setInterval(() => {
      // Display frame
      if (animation.frames[this.currentFrameIndex]) {
        this.ledGrid = [...animation.frames[this.currentFrameIndex]];
      }

      // Increment frame counter and loop
      this.currentFrameIndex = (this.currentFrameIndex + 1) % animation.frames.length;
    }, animation.frameRate || 150);
  }

  /**
   * Stop the current animation
   */
  private stopAnimation() {
    if (this.animationIntervalId) {
      clearInterval(this.animationIntervalId);
      this.animationIntervalId = null;
    }
    // Clear the grid
    this.ledGrid.fill(false);
    this.currentFrameIndex = 0;
  }

  /**
   * Check if pattern is selected
   */
  isPatternSelected(pattern: AnimationPattern | CustomAnimation): boolean {
    return this.selectedPattern?.id === pattern.id;
  }

  /**
   * Get pattern name
   */
  getPatternName(pattern: AnimationPattern | CustomAnimation): string {
    return pattern.name;
  }

}
