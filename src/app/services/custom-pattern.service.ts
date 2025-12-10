import { Injectable } from '@angular/core';
import { Database, ref, set, get, push, query, orderByChild, equalTo, onValue, off } from '@angular/fire/database';
import { Auth } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';

export interface CustomAnimation {
  id: string;
  name: string;
  code: string;
  codeType: 'json';
  frames: boolean[][];
  frameRate: number;
  createdAt: number;
  updatedAt: number;
  isShared: boolean;
  sharedAt?: number;
  creatorId?: string;
  creatorName?: string;
  creatorPhotoURL?: string;
  likes?: number;
  downloads?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomPatternService {
  private communityAnimationsSubject = new BehaviorSubject<CustomAnimation[]>([]);
  public communityAnimations$: Observable<CustomAnimation[]> = this.communityAnimationsSubject.asObservable();
  private communityListenerUnsubscribe?: () => void;

  constructor(
    private database: Database,
    private auth: Auth
  ) {}

  /**
   * Save animation to user's database (for "Save" button)
   * Saves to /users/{userId}/animations/{animationId}
   */
  async saveUserAnimation(animationData: Omit<CustomAnimation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const animationId = push(ref(this.database, `users/${user.uid}/animations`)).key;
    if (!animationId) {
      throw new Error('Failed to generate animation ID');
    }

    const now = Date.now();
    const animation: CustomAnimation = {
      id: animationId,
      ...animationData,
      createdAt: now,
      updatedAt: now,
      isShared: false
    };

    await set(ref(this.database, `users/${user.uid}/animations/${animationId}`), animation);
    return animationId;
  }

  /**
   * Share animation to community (for "Share" button)
   * Copies to /discuss/animations/{animationId} and sets isShared: true in user's copy
   */
  async shareToCommunity(animationId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's animation
    const userAnimRef = ref(this.database, `users/${user.uid}/animations/${animationId}`);
    const snapshot = await get(userAnimRef);
    
    if (!snapshot.exists()) {
      throw new Error('Animation not found');
    }

    const userAnimation = snapshot.val() as CustomAnimation;

    // Create community animation with creator info
    const communityAnimation: CustomAnimation = {
      ...userAnimation,
      creatorId: user.uid,
      creatorName: user.displayName || 'Anonymous',
      creatorPhotoURL: user.photoURL || '',
      likes: 0,
      downloads: 0,
      sharedAt: Date.now()
    };

    // Save to community
    await set(ref(this.database, `discuss/animations/${animationId}`), communityAnimation);

    // Update user's animation to mark as shared
    await set(ref(this.database, `users/${user.uid}/animations/${animationId}/isShared`), true);
    await set(ref(this.database, `users/${user.uid}/animations/${animationId}/sharedAt`), Date.now());
  }

  /**
   * Get all user's animations
   */
  async getUserAnimations(userId: string): Promise<CustomAnimation[]> {
    const animationsRef = ref(this.database, `users/${userId}/animations`);
    const snapshot = await get(animationsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const animations = snapshot.val();
    return Object.values(animations) as CustomAnimation[];
  }

  /**
   * Get all community animations (from discuss page)
   */
  async getCommunityAnimations(): Promise<CustomAnimation[]> {
    const animationsRef = ref(this.database, `discuss/animations`);
    const snapshot = await get(animationsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const animations = snapshot.val();
    const animationsArray = Object.entries(animations).map(([id, anim]: [string, any]) => ({
      ...anim,
      id: id
    })) as CustomAnimation[];
    
    return animationsArray;
  }

  /**
   * Subscribe to real-time community animations updates
   * Returns an observable that emits when animations change
   */
  subscribeToCommunityAnimations(): Observable<CustomAnimation[]> {
    const animationsRef = ref(this.database, `discuss/animations`);
    
    // Unsubscribe from previous listener if exists
    if (this.communityListenerUnsubscribe) {
      this.communityListenerUnsubscribe();
    }

    // Set up real-time listener
    onValue(animationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const animations = snapshot.val();
        const animationsArray = Object.entries(animations).map(([id, anim]: [string, any]) => ({
          ...anim,
          id: id
        })) as CustomAnimation[];
        this.communityAnimationsSubject.next(animationsArray);
      } else {
        this.communityAnimationsSubject.next([]);
      }
    }, (error) => {
      console.error('Error listening to community animations:', error);
      this.communityAnimationsSubject.next([]);
    });

    // Store unsubscribe function
    this.communityListenerUnsubscribe = () => {
      off(animationsRef);
    };

    return this.communityAnimations$;
  }

  /**
   * Unsubscribe from community animations listener
   */
  unsubscribeFromCommunityAnimations(): void {
    if (this.communityListenerUnsubscribe) {
      this.communityListenerUnsubscribe();
      this.communityListenerUnsubscribe = undefined;
    }
  }

  /**
   * Search community animations by name or creator
   */
  async searchCommunityAnimations(query: string): Promise<CustomAnimation[]> {
    const allAnimations = await this.getCommunityAnimations();
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) {
      return allAnimations;
    }

    return allAnimations.filter(anim => 
      anim.name.toLowerCase().includes(lowerQuery) ||
      anim.creatorName?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filter and sort community animations
   */
  async filterAndSortCommunityAnimations(
    sortBy: 'newest' | 'popular' | 'downloads' = 'newest',
    searchQuery?: string
  ): Promise<CustomAnimation[]> {
    let animations = await this.getCommunityAnimations();

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      animations = await this.searchCommunityAnimations(searchQuery);
    }

    // Apply sort
    switch (sortBy) {
      case 'newest':
        animations.sort((a, b) => (b.sharedAt || b.createdAt) - (a.sharedAt || a.createdAt));
        break;
      case 'popular':
        animations.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'downloads':
        animations.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
    }

    return animations;
  }

  /**
   * Get single animation by ID from community
   */
  async getCommunityAnimation(animationId: string): Promise<CustomAnimation | null> {
    const animationRef = ref(this.database, `discuss/animations/${animationId}`);
    const snapshot = await get(animationRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val() as CustomAnimation;
  }

  /**
   * Save community animation to user's collection (for "Use" button in discuss page)
   */
  async saveCommunityAnimationToUser(animationId: string): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get animation from community
    const communityAnimation = await this.getCommunityAnimation(animationId);
    if (!communityAnimation) {
      throw new Error('Animation not found in community');
    }

    // Create new animation in user's collection (without creator info)
    const newAnimationId = push(ref(this.database, `users/${user.uid}/animations`)).key;
    if (!newAnimationId) {
      throw new Error('Failed to generate animation ID');
    }

    const now = Date.now();
    const userAnimation: CustomAnimation = {
      ...communityAnimation,
      id: newAnimationId,
      isShared: false,
      createdAt: now,
      updatedAt: now,
      // Remove creator info when saving to user's collection
      creatorId: undefined,
      creatorName: undefined,
      creatorPhotoURL: undefined
    };

    await set(ref(this.database, `users/${user.uid}/animations/${newAnimationId}`), userAnimation);

    // Increment download count in community
    const currentDownloads = communityAnimation.downloads || 0;
    await set(ref(this.database, `discuss/animations/${animationId}/downloads`), currentDownloads + 1);

    return newAnimationId;
  }

  /**
   * Delete user's animation
   */
  async deleteUserAnimation(animationId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    await set(ref(this.database, `users/${user.uid}/animations/${animationId}`), null);
  }

  /**
   * Update user's animation
   */
  async updateUserAnimation(animationId: string, updates: Partial<CustomAnimation>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current animation
    const currentRef = ref(this.database, `users/${user.uid}/animations/${animationId}`);
    const snapshot = await get(currentRef);
    
    if (!snapshot.exists()) {
      throw new Error('Animation not found');
    }

    const currentAnimation = snapshot.val() as CustomAnimation;
    const updatedAnimation = {
      ...currentAnimation,
      ...updates,
      updatedAt: Date.now()
    };

    await set(ref(this.database, `users/${user.uid}/animations/${animationId}`), updatedAnimation);
  }

  /**
   * Like an animation in community
   */
  async likeAnimation(animationId: string): Promise<void> {
    const animation = await this.getCommunityAnimation(animationId);
    if (!animation) {
      throw new Error('Animation not found');
    }

    const currentLikes = animation.likes || 0;
    await set(ref(this.database, `discuss/animations/${animationId}/likes`), currentLikes + 1);
  }

  /**
   * Unlike an animation in community
   */
  async unlikeAnimation(animationId: string): Promise<void> {
    const animation = await this.getCommunityAnimation(animationId);
    if (!animation) {
      throw new Error('Animation not found');
    }

    const currentLikes = Math.max((animation.likes || 0) - 1, 0);
    await set(ref(this.database, `discuss/animations/${animationId}/likes`), currentLikes);
  }
}

