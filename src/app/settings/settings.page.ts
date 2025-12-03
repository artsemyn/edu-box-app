import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

// 👉 Tambahkan interface
interface User {
  name: string;
  role: string;
  status: 'owner' | 'viewer';
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})

export class SettingsPage implements OnInit {

  bluetoothStatus: 'Disconnected' | 'Scanning' | 'Connected' = 'Disconnected';
  statusMessage = 'No device found nearby.';

  loggedInUserName: string = '';

  // 👉 Tentukan tipe datanya
  authorizedUsers: User[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const savedName = localStorage.getItem('username');

    this.loggedInUserName = savedName ? savedName : 'User';

    // 👉 Isi data sesuai tipe User
    this.authorizedUsers = [
      { name: this.loggedInUserName, role: 'Owner', status: 'owner' },
      { name: 'Guest User 1', role: 'Viewer', status: 'viewer' }
    ];
  }

  startPairing() {
    if (this.bluetoothStatus === 'Scanning') return;

    this.bluetoothStatus = 'Scanning';
    this.statusMessage = 'Scanning for devices... Please wait...';

    setTimeout(() => {
      const success = Math.random() > 0.5;

      if (success) {
        this.bluetoothStatus = 'Connected';
        this.statusMessage = 'Device "MyLightHub" connected successfully.';
      } else {
        this.bluetoothStatus = 'Disconnected';
        this.statusMessage = 'Pairing failed. No device found nearby.';
      }

    }, 4000);
  }

  openUserSettings(user: User) {
    console.log('Open settings for:', user.name);
  }
}
