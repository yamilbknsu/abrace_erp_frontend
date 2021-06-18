import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArrendatariosComponent } from './arrendatarios/arrendatarios.component';

const routes: Routes = [
  {path: '', component: ArrendatariosComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArrendatariosRoutingModule { }
