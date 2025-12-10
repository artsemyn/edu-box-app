import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscussPage } from './discuss.page';

const routes: Routes = [
  {
    path: '',
    component: DiscussPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscussPageRoutingModule { }

