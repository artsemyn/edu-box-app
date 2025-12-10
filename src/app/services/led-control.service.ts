import { Injectable } from '@angular/core';
import { Database, ref, set, onValue, Unsubscribe } from '@angular/fire/database';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { AnimationPattern } from './animation-pattern.service';

export interface AnimationStatus {
  animNumber: number;
  animationId?: string;
  animationName?: string;
  isPlaying: boolean;
  startedAt: number; // timestamp
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LedControlService {
  private animRef: any = null;
  private animStatusRef: any = null;
  private currentAnimationSubject = new BehaviorSubject<number | null>(null);
  public currentAnimation$: Observable<number | null> = this.currentAnimationSubject.asObservable();
  private isConnected = false;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$: Observable<boolean> = this.connectionStatusSubject.asObservable();
  private animationUnsubscribe: Unsubscribe | null = null;

  constructor(
    private database: Database,
    private auth: Auth
  ) {}

  /**
   * Initialize Firebase Database connection and anonymous authentication
   */
  async initializeConnection(): Promise<void> {
    try {
      // Sign in anonymously
      const userCredential = await signInAnonymously(this.auth);

      // Set up database references
      this.animRef = ref(this.database, 'ledMatrix/animation');
      this.animStatusRef = ref(this.database, 'ledMatrix/currentAnimation');

      // Listen for animation changes
      this.animationUnsubscribe = onValue(this.animRef, (snapshot) => {
        const animNumber = snapshot.val();
        this.currentAnimationSubject.next(animNumber);
      }, (error) => {
        console.error('Error listening to animation:', error);
        this.isConnected = false;
        this.connectionStatusSubject.next(false);
      });

      this.isConnected = true;
      this.connectionStatusSubject.next(true);
    } catch (error) {
      console.error('Error initializing Firebase connection:', error);
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
      throw error;
    }
  }

  /**
   * Set animation on LED matrix
   * @param animNumber Animation number (0-10, where 0 = stop, 1-10 = animations)
   * @param pattern Optional animation pattern for tracking
   */
  async setAnimation(animNumber: number, pattern?: AnimationPattern): Promise<void> {
    if (!this.animRef) {
      throw new Error('Firebase not initialized. Call initializeConnection() first.');
    }

    if (animNumber < 0 || animNumber > 14) {
      throw new Error('Animation number must be between 0 and 14');
    }

    try {
      // Set animation number (for device control)
      await set(this.animRef, animNumber);
      console.log('Animation set to:', animNumber);

      // Set animation status with detailed information (for tracking)
      if (this.animStatusRef) {
        const status: AnimationStatus = {
          animNumber: animNumber,
          isPlaying: animNumber > 0,
          startedAt: Date.now(),
          userId: this.auth.currentUser?.uid || 'anonymous'
        };

        // Add pattern information if provided
        if (pattern) {
          status.animationId = pattern.id;
          status.animationName = pattern.name;
        }

        await set(this.animStatusRef, status);
        console.log('Animation status updated:', status);
      }
    } catch (error) {
      console.error('Error setting animation:', error);
      throw error;
    }
  }

  /**
   * Stop animation (sets animation to 0)
   */
  async stopAnimation(): Promise<void> {
    await this.setAnimation(0);
    
    // Update status to stopped
    if (this.animStatusRef) {
      const status: AnimationStatus = {
        animNumber: 0,
        isPlaying: false,
        startedAt: Date.now(),
        userId: this.auth.currentUser?.uid || 'anonymous'
      };
      await set(this.animStatusRef, status);
    }
  }

  /**
   * Get current animation number
   */
  getCurrentAnimation(): number | null {
    return this.currentAnimationSubject.value;
  }

  /**
   * Check if connected to Firebase
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    if (this.animationUnsubscribe) {
      this.animationUnsubscribe();
      this.animationUnsubscribe = null;
    }
  }
}
