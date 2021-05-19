import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InfEstadoArriendosComponent } from './inf-estado-arriendos/inf-estado-arriendos.component';
import { InfEstadoLiquidacionesComponent } from './inf-estado-liquidaciones/inf-estado-liquidaciones.component';
import { InfEstadoPagosComponent } from './inf-estado-pagos/inf-estado-pagos.component';
import { InfLiquidacionComponent } from './inf-liquidacion/inf-liquidacion.component';
import { LiquidacionInformeResolverService } from './inf-liquidacion/liquidacion-informe.resolver.service';
import { InfPagosComponent } from './inf-pagos/inf-pagos.component';
import { PagoInformeResolverService } from './inf-pagos/pago-informe.service';
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
        component: InfPagosComponent,
        resolve: {propiedades: PagoInformeResolverService}
      },
      {
        path: 'liquidaciones',
        component: InfLiquidacionComponent,
        resolve: {propiedades: LiquidacionInformeResolverService}
      },
      {
        path: 'resumenliquidaciones',
        component: InfEstadoLiquidacionesComponent
      },
      {
        path: 'resumenpagos',
        component: InfEstadoPagosComponent
      },
      {
        path: 'resumenarriendos',
        component: InfEstadoArriendosComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformesRoutingModule { }
