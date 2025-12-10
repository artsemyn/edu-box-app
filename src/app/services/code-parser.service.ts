import { Injectable } from '@angular/core';
import { AnimationPatternService, AnimationPattern } from './animation-pattern.service';

export interface ParsedFrames {
  frames: boolean[][];
  frameRate: number;
  isValid: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CodeParserService {
  constructor(private animationPatternService: AnimationPatternService) {}

  /**
   * Parse JSON code to generate frames array
   * First tries to match known pattern, then parses JSON frames if available
   */
  parseJsonCode(jsonCode: string): ParsedFrames {
    try {
      // Clean and parse JSON
      const cleanedCode = jsonCode.trim();
      const parsed = JSON.parse(cleanedCode);

      // Try to match known pattern first
      if (parsed.animation && parsed.type) {
        const knownPattern = this.animationPatternService.getPatternById(parsed.type);
        if (knownPattern) {
          // Generate frames from known pattern
          const frames: boolean[][] = [];
          const frameCount = 60; // Generate 60 frames for preview
          
          for (let i = 0; i < frameCount; i++) {
            frames.push(knownPattern.generateFrame(i));
          }

          return {
            frames,
            frameRate: knownPattern.frameRate,
            isValid: true
          };
        }
      }

      // Try to parse frames from JSON structure
      if (parsed.frames && Array.isArray(parsed.frames)) {
        const frames: boolean[][] = [];
        
        for (const frame of parsed.frames) {
          if (frame.matrix && Array.isArray(frame.matrix)) {
            // Convert 2D matrix to flat boolean array
            const flatFrame: boolean[] = [];
            for (const row of frame.matrix) {
              if (Array.isArray(row)) {
                for (const cell of row) {
                  flatFrame.push(cell === 1 || cell === true);
                }
              }
            }
            
            // Ensure 36 LEDs (6x6)
            while (flatFrame.length < 36) {
              flatFrame.push(false);
            }
            frames.push(flatFrame.slice(0, 36));
          }
        }

        if (frames.length > 0) {
          return {
            frames,
            frameRate: parsed.frameRate || 150,
            isValid: true
          };
        }
      }

      // If JSON has direct frame data structure
      if (parsed.matrix && Array.isArray(parsed.matrix)) {
        const flatFrame: boolean[] = [];
        for (const row of parsed.matrix) {
          if (Array.isArray(row)) {
            for (const cell of row) {
              flatFrame.push(cell === 1 || cell === true);
            }
          }
        }
        
        while (flatFrame.length < 36) {
          flatFrame.push(false);
        }

        return {
          frames: [flatFrame.slice(0, 36)],
          frameRate: parsed.frameRate || 150,
          isValid: true
        };
      }

      return {
        frames: [],
        frameRate: 150,
        isValid: false,
        error: 'JSON tidak mengandung data frame yang valid'
      };

    } catch (error: any) {
      return {
        frames: [],
        frameRate: 150,
        isValid: false,
        error: `Error parsing JSON: ${error.message}`
      };
    }
  }

  /**
   * Validate JSON code syntax
   */
  validateJsonCode(jsonCode: string): { isValid: boolean; error?: string } {
    try {
      JSON.parse(jsonCode.trim());
      return { isValid: true };
    } catch (error: any) {
      return {
        isValid: false,
        error: `Invalid JSON: ${error.message}`
      };
    }
  }
}

