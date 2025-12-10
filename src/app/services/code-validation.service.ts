import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodeValidationService {
  // Valid code for animation access
  // You can change this code as needed
  private readonly VALID_CODE = 'EDUBOX2024';
  
  // Storage key for localStorage
  private readonly STORAGE_KEY = 'edubox_code_validated';
  
  // Observable untuk track validation status
  private validationStatus$ = new BehaviorSubject<boolean>(this.isCodeValidated());

  constructor() {
    // Load validation status from localStorage on init
    const isValidated = this.isCodeValidated();
    this.validationStatus$.next(isValidated);
  }

  /**
   * Get validation status observable
   */
  getValidationStatus$(): Observable<boolean> {
    return this.validationStatus$.asObservable();
  }

  /**
   * Get current validation status
   */
  getValidationStatus(): boolean {
    return this.validationStatus$.value;
  }

  /**
   * Validate the input code
   * @param code The code to validate
   * @returns true if code is valid, false otherwise
   */
  validateCode(code: string): boolean {
    const isValid = code.trim().toUpperCase() === this.VALID_CODE.toUpperCase();
    
    if (isValid) {
      // Save validation status to localStorage
      localStorage.setItem(this.STORAGE_KEY, 'true');
      // Update observable
      this.validationStatus$.next(true);
    }
    
    return isValid;
  }

  /**
   * Validate JSON code for specific animation
   * @param jsonCode The JSON code string to validate
   * @param expectedJsonCode The expected JSON code for the animation
   * @returns true if JSON code is valid, false otherwise
   */
  validateJsonCode(jsonCode: string, expectedJsonCode: string): boolean {
    try {
      // Normalize JSON strings (remove whitespace, sort keys)
      const normalizeJson = (jsonStr: string): string => {
        const parsed = JSON.parse(jsonStr);
        return JSON.stringify(parsed);
      };

      const normalizedInput = normalizeJson(jsonCode.trim());
      const normalizedExpected = normalizeJson(expectedJsonCode.trim());

      return normalizedInput === normalizedExpected;
    } catch (error) {
      // Invalid JSON format
      return false;
    }
  }

  /**
   * Validate JSON code and save validation for specific animation
   * @param jsonCode The JSON code to validate
   * @param animationId The animation ID
   * @param expectedJsonCode The expected JSON code
   * @returns true if valid, false otherwise
   */
  validateAndSaveAnimationCode(jsonCode: string, animationId: string, expectedJsonCode: string): boolean {
    const isValid = this.validateJsonCode(jsonCode, expectedJsonCode);
    
    if (isValid && expectedJsonCode) {
      // Save validation status for this specific animation
      const validatedAnimations = this.getValidatedAnimations();
      validatedAnimations[animationId] = true;
      localStorage.setItem('edubox_validated_animations', JSON.stringify(validatedAnimations));
    }
    
    return isValid;
  }

  /**
   * Check if animation is already validated
   * @param animationId The animation ID
   * @returns true if validated, false otherwise
   */
  isAnimationValidated(animationId: string): boolean {
    const validatedAnimations = this.getValidatedAnimations();
    return validatedAnimations[animationId] === true;
  }

  /**
   * Get all validated animations
   * @returns Object with animation IDs as keys
   */
  private getValidatedAnimations(): { [key: string]: boolean } {
    const stored = localStorage.getItem('edubox_validated_animations');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Reset validation for specific animation
   * @param animationId The animation ID to reset
   */
  resetAnimationValidation(animationId: string): void {
    const validatedAnimations = this.getValidatedAnimations();
    delete validatedAnimations[animationId];
    localStorage.setItem('edubox_validated_animations', JSON.stringify(validatedAnimations));
  }

  /**
   * Reset all animation validations
   */
  resetAllAnimationValidations(): void {
    localStorage.removeItem('edubox_validated_animations');
  }

  /**
   * Check if code has been validated (stored in localStorage)
   */
  isCodeValidated(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored === 'true';
  }

  /**
   * Reset validation (logout or manual reset)
   */
  resetValidation(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.validationStatus$.next(false);
  }

  /**
   * Get the valid code (for testing/admin purposes)
   * Note: In production, you might want to remove this or make it secure
   */
  getValidCode(): string {
    return this.VALID_CODE;
  }
}
