import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BancosComponent } from './bancos/bancos.component';
import { IpcUfComponent } from './ipc-uf/ipc-uf.component';
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
      },
      {
        path: 'bancos',
        component: BancosComponent
      },
      {
        path: 'ipcuf',
        component: IpcUfComponent
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametrosRoutingModule { }
