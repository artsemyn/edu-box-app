import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CodeEditorPage } from './code-editor.page';
import { CodeEditorPageRoutingModule } from './code-editor-routing.module';

@NgModule({
  declarations: [CodeEditorPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CodeEditorPageRoutingModule
  ]
})
export class CodeEditorPageModule { }
