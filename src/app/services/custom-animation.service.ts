import { Injectable } from '@angular/core';
import { Database, ref, set, get, push } from '@angular/fire/database';

export interface CustomAnimation {
  id?: string;
  name: string;
  code: string;
  type: 'json' | 'arduino';
  frames?: any[];
  frameRate?: number;
  createdAt: number;
  updatedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomAnimationService {
  private readonly STORAGE_KEY = 'customAnimations';

  constructor(private db: Database) {}

  /**
   * Save animation to both Firebase and local storage
   */
  async saveAnimation(animation: CustomAnimation, userId: string): Promise<string> {
    try {
      // Generate ID if not provided
      if (!animation.id) {
        animation.id = `custom_${Date.now()}`;
      }

      // Add timestamps
      animation.updatedAt = Date.now();
      if (!animation.createdAt) {
        animation.createdAt = Date.now();
      }

      // Save to Firebase
      const animationRef = ref(this.db, `users/${userId}/customAnimations/${animation.id}`);
      await set(animationRef, animation);

      // Save to local storage as backup
      this.saveToLocalStorage(animation, userId);

      return animation.id;
    } catch (error) {
      console.error('Error saving animation:', error);
      // If Firebase fails, still save to local storage
      this.saveToLocalStorage(animation, userId);
      throw error;
    }
  }

  /**
   * Save to local storage
   */
  private saveToLocalStorage(animation: CustomAnimation, userId: string) {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const stored = localStorage.getItem(key);
      const animations: CustomAnimation[] = stored ? JSON.parse(stored) : [];
      
      // Update or add animation
      const index = animations.findIndex(a => a.id === animation.id);
      if (index !== -1) {
        animations[index] = animation;
      } else {
        animations.push(animation);
      }

      localStorage.setItem(key, JSON.stringify(animations));
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }

  /**
   * Load animations from Firebase
   */
  async loadAnimations(userId: string): Promise<CustomAnimation[]> {
    try {
      const animationsRef = ref(this.db, `users/${userId}/customAnimations`);
      const snapshot = await get(animationsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
      }
      
      // If no Firebase data, try local storage
      return this.loadFromLocalStorage(userId);
    } catch (error) {
      console.error('Error loading animations from Firebase:', error);
      return this.loadFromLocalStorage(userId);
    }
  }

  /**
   * Load from local storage
   */
  private loadFromLocalStorage(userId: string): CustomAnimation[] {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading from local storage:', error);
      return [];
    }
  }

  /**
   * Delete animation
   */
  async deleteAnimation(animationId: string, userId: string): Promise<void> {
    try {
      // Delete from Firebase
      const animationRef = ref(this.db, `users/${userId}/customAnimations/${animationId}`);
      await set(animationRef, null);

      // Delete from local storage
      this.deleteFromLocalStorage(animationId, userId);
    } catch (error) {
      console.error('Error deleting animation:', error);
      // Still try to delete from local storage
      this.deleteFromLocalStorage(animationId, userId);
    }
  }

  /**
   * Delete from local storage
   */
  private deleteFromLocalStorage(animationId: string, userId: string) {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const animations: CustomAnimation[] = JSON.parse(stored);
        const filtered = animations.filter(a => a.id !== animationId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Error deleting from local storage:', error);
    }
  }

  /**
   * Validate JSON animation code
   */
  validateJsonCode(code: string): { valid: boolean; error?: string; data?: any } {
    try {
      const data = JSON.parse(code);
      
      // Check required fields
      if (!data.animationName) {
        return { valid: false, error: 'Missing "animationName" field' };
      }
      
      if (!data.frames || !Array.isArray(data.frames)) {
        return { valid: false, error: 'Missing or invalid "frames" array' };
      }

      // Validate frames
      for (let i = 0; i < data.frames.length; i++) {
        const frame = data.frames[i];
        
        if (!frame.matrix || !Array.isArray(frame.matrix)) {
          return { valid: false, error: `Frame ${i}: Missing or invalid "matrix" array` };
        }

        if (frame.matrix.length !== 6) {
          return { valid: false, error: `Frame ${i}: Matrix must have 6 rows` };
        }

        for (let row = 0; row < 6; row++) {
          if (!Array.isArray(frame.matrix[row]) || frame.matrix[row].length !== 6) {
            return { valid: false, error: `Frame ${i}, Row ${row}: Must have 6 columns` };
          }

          for (let col = 0; col < 6; col++) {
            const value = frame.matrix[row][col];
            if (value !== 0 && value !== 1) {
              return { valid: false, error: `Frame ${i}, Row ${row}, Col ${col}: Value must be 0 or 1` };
            }
          }
        }
      }

      return { valid: true, data };
    } catch (error) {
      return { valid: false, error: 'Invalid JSON format: ' + (error as Error).message };
    }
  }
}
