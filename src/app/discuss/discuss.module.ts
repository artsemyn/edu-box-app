import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DiscussPage } from './discuss.page';
import { DiscussPageRoutingModule } from './discuss-routing.module';

@NgModule({
  declarations: [DiscussPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscussPageRoutingModule
  ]
})
export class DiscussPageModule { }

