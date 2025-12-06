import { Injectable } from '@angular/core';
import { Database, ref, set, onValue, Unsubscribe } from '@angular/fire/database';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LedControlService {
  private animRef: any = null;
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
      await signInAnonymously(this.auth);

      // Set up database reference
      this.animRef = ref(this.database, 'ledMatrix/animation');

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
   */
  async setAnimation(animNumber: number): Promise<void> {
    if (!this.animRef) {
      throw new Error('Firebase not initialized. Call initializeConnection() first.');
    }

    if (animNumber < 0 || animNumber > 10) {
      throw new Error('Animation number must be between 0 and 10');
    }

    try {
      await set(this.animRef, animNumber);
      console.log('Animation set to:', animNumber);
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
