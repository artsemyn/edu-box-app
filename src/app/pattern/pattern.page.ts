import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

interface Pattern {
  name: string;
  duration: string;
}

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
export class PatternPage {
  patterns: Pattern[] = [
    { name: 'Rainbow Wave', duration: '2:30' },
    { name: 'Color Wipe', duration: '1:45' },
    { name: 'Theater Chase', duration: '3:15' },
    { name: 'Fire', duration: '2:00' },
    { name: 'Confetti', duration: '1:30' },
    { name: 'Pride', duration: '2:45' },
  ];

  currentPattern: Pattern | null = null;

  constructor() {}

  selectPattern(pattern: Pattern) {
    this.currentPattern = pattern;
    console.log('Selected pattern:', pattern.name);
  }
}
