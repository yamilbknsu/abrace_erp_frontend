import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccionesComponent } from './acciones/acciones.component';
import { CierremesComponent } from './cierremes/cierremes.component';
import { CierresResolverService } from './cierremes/cierres-resolver.service';
import { EgresosComponent } from './egresos/egresos.component';
import { IngresoComponent } from './ingreso/ingreso.component';
import { LiquidacionResolverService } from './liquidacion/liquidacion-resolver.service';
import { LiquidacionComponent } from './liquidacion/liquidacion.component';
import { PagoArriendoResolverService } from './pago-arriendo/pago-arriendo-resolver.service';
import { PagoArriendoComponent } from './pago-arriendo/pago-arriendo.component';
import { ReajusteDeRentasComponent } from './reajuste-de-rentas/reajuste-de-rentas.component';
import { ReajusteExtraordinarioComponent } from './reajuste-extraordinario/reajuste-extraordinario.component';

const routes: Routes = [
  {
    path: '',
    component: AccionesComponent,
    children: [
      {
        path: 'cierremes',
        component: CierremesComponent,
        //resolve: {cierres: CierresResolverService}
      },
      {
        path: 'reajustes',
        component: ReajusteDeRentasComponent
      },
      {
        path: 'reajusteextraordinario',
        component: ReajusteExtraordinarioComponent
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
      },
      {
        path: 'ingreso',
        component: IngresoComponent
      },
      {
        path: 'egreso',
        component: EgresosComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccionesRoutingModule { }
