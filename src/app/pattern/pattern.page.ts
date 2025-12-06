import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AnimationPatternService, AnimationPattern } from '../services/animation-pattern.service';
import { LedControlService } from '../services/led-control.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pattern',
  templateUrl: 'pattern.page.html',
  styleUrls: ['pattern.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ]
})
export class PatternPage implements OnInit, OnDestroy {
  patterns: AnimationPattern[] = [];
  currentPattern: AnimationPattern | null = null;
  searchText: string = '';
  sortOption: 'name' | 'duration' = 'name';
  private favoriteNames = new Set<string>();
  favoritesOnly = false;
  isConnected: boolean = false;
  currentAnimationNumber: number | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private themeService: ThemeService,
    private animationPatternService: AnimationPatternService,
    private ledControlService: LedControlService
  ) {
    // Load patterns from service
    this.patterns = this.animationPatternService.getPatterns();
  }

  async ngOnInit() {
    // Initialize Firebase connection if not already initialized
    try {
      if (!this.ledControlService.getConnectionStatus()) {
        await this.ledControlService.initializeConnection();
      }
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

    // Subscribe to current animation changes from Firebase
    const animationSub = this.ledControlService.currentAnimation$.subscribe(
      (animNumber) => {
        this.currentAnimationNumber = animNumber;
        // Update current pattern based on Firebase state
        if (animNumber === null || animNumber === 0) {
          this.currentPattern = null;
        } else {
          const matchingPattern = this.patterns.find(p => p.animNumber === animNumber);
          if (matchingPattern) {
            this.currentPattern = matchingPattern;
          }
        }
      }
    );
    this.subscriptions.push(animationSub);
  }

  ngOnDestroy() {
    // Unsubscribe from observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get filteredPatterns(): AnimationPattern[] {
    const q = this.searchText?.toLowerCase().trim();
    let base = this.patterns;
    if (q) {
      base = base.filter(p =>
        p.name.toLowerCase().includes(q) || p.duration.toLowerCase().includes(q)
      );
    }
    if (this.favoritesOnly) {
      base = base.filter(p => this.favoriteNames.has(p.name));
    }
    return base;
  }

  get sortedFilteredPatterns(): AnimationPattern[] {
    const base = this.filteredPatterns.slice();
    if (this.sortOption === 'name') {
      base.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Extract seconds from mm:ss or m:ss; if non-numeric, push to end
      const parseDur = (d: string) => {
        const parts = d.split(':');
        if (parts.length === 2) {
          const m = parseInt(parts[0], 10);
          const s = parseInt(parts[1], 10);
          if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
        }
        return Number.POSITIVE_INFINITY;
      };
      base.sort((a, b) => parseDur(a.duration) - parseDur(b.duration));
    }
    return base;
  }

  onSortChange(val: any) {
    if (val === 'name' || val === 'duration') this.sortOption = val;
  }

  toggleFavorite(p: AnimationPattern) {
    if (this.favoriteNames.has(p.name)) {
      this.favoriteNames.delete(p.name);
    } else {
      this.favoriteNames.add(p.name);
    }
  }

  isFavorite(p: AnimationPattern): boolean {
    return this.favoriteNames.has(p.name);
  }

  onFavToggle(ev: any) {
    this.favoritesOnly = !!ev?.detail?.checked;
  }

  async selectPattern(pattern: AnimationPattern) {
    if (this.currentPattern?.id === pattern.id) {
      // Toggle off if same pattern - send stop command to Firebase
      try {
        await this.ledControlService.stopAnimation();
      } catch (error) {
        console.error('Error stopping animation:', error);
      }
    } else {
      // Start new pattern - send command to Firebase
      try {
        await this.ledControlService.setAnimation(pattern.animNumber);
      } catch (error) {
        console.error('Error setting animation:', error);
      }
    }
  }
}