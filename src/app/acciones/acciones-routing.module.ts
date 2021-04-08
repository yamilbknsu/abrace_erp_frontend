import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccionesComponent } from './acciones/acciones.component';
import { CierremesComponent } from './cierremes/cierremes.component';
import { CierresResolverService } from './cierremes/cierres-resolver.service';
import { LiquidacionResolverService } from './liquidacion/liquidacion-resolver.service';
import { LiquidacionComponent } from './liquidacion/liquidacion.component';
import { PagoArriendoResolverService } from './pago-arriendo/pago-arriendo-resolver.service';
import { PagoArriendoComponent } from './pago-arriendo/pago-arriendo.component';

const routes: Routes = [
  {
    path: '',
    component: AccionesComponent,
    children: [
      {
        path: 'cierremes',
        component: CierremesComponent,
        resolve: {cierres: CierresResolverService}
      },
      {
        path: 'pagoarriendo',
        component: PagoArriendoComponent,
        resolve: {propiedades: PagoArriendoResolverService}
      },
      {
        path: 'liquidacion',
        component: LiquidacionComponent,
        resolve: {propiedades: LiquidacionResolverService}
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccionesRoutingModule { }
