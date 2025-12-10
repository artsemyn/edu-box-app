import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ProfileSettingsPage } from './profile-settings.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileSettingsPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileSettingsPage,  // Import the standalone component
    RouterModule.forChild(routes)
  ]
})
export class ProfileSettingsPageModule {}
