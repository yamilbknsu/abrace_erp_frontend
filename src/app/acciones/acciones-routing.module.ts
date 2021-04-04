import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccionesComponent } from './acciones/acciones.component';
import { CierremesComponent } from './cierremes/cierremes.component';
import { CierresResolverService } from './cierremes/cierres-resolver.service';
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccionesRoutingModule { }
