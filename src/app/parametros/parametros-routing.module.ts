import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParametrosComponent } from './parametros/parametros.component';
import { RegionesComponent } from './regiones/regiones.component';

const routes: Routes = [
  {
    path: '',
    component: ParametrosComponent,
    children: [
      {
        path: 'regiones',
        component: RegionesComponent
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametrosRoutingModule { }
