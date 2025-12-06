import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AnimationPatternService, AnimationPattern } from '../services/animation-pattern.service';
import { LedControlService } from '../services/led-control.service';
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
  selectedPattern: AnimationPattern | null = null;
  currentFrameIndex: number = 0;
  animationIntervalId: any = null;
  patterns: AnimationPattern[] = [];

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
    private ledControlService: LedControlService
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

  ngOnDestroy() {
    // Stop animation when leaving page to prevent memory leaks
    this.stopAnimation();
    // Unsubscribe from observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Select and play an animation pattern
   * @param pattern The pattern to play
   */
  async selectPattern(pattern: AnimationPattern) {
    if (this.selectedPattern?.id === pattern.id) {
      // Toggle off if same pattern - send stop command to Firebase
      await this.ledControlService.stopAnimation();
      this.selectedPattern = null;
      this.stopAnimation();
    } else {
      // Start new pattern - send command to Firebase
      try {
        await this.ledControlService.setAnimation(pattern.animNumber);
        this.selectedPattern = pattern;
        // Start local preview
        this.startAnimation(pattern);
      } catch (error) {
        console.error('Error setting animation:', error);
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
   * Navigate to patterns page
   */
  navigateToPatterns() {
    this.router.navigate(['/pattern']);
  }
}
