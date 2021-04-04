import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InfPagosComponent } from './inf-pagos/inf-pagos.component';
import { InfPropiedadesComponent } from './inf-propiedades/inf-propiedades.component';
import { InformesComponent } from './informes/informes.component';
import { InfReajustesComponent } from './reajustes/reajustes.component';

const routes: Routes = [
  {
    path: '',
    component: InformesComponent,
    children: [
      {
        path: 'propiedades',
        component: InfPropiedadesComponent
      },
      {
        path: 'reajustes',
        component: InfReajustesComponent
      },
      {
        path: 'pagos',
        component: InfPagosComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformesRoutingModule { }
