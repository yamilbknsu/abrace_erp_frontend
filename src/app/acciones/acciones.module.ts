import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccionesRoutingModule } from './acciones-routing.module';
import { AccionesComponent } from './acciones/acciones.component';
import { CierremesComponent } from './cierremes/cierremes.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { GUIModule } from '../gui/gui.module';
import { FormsModule } from '@angular/forms';
import { PagoArriendoComponent } from './pago-arriendo/pago-arriendo.component';
import { LiquidacionComponent } from './liquidacion/liquidacion.component';


@NgModule({
  declarations: [AccionesComponent, CierremesComponent, PagoArriendoComponent, LiquidacionComponent],
  imports: [
    CommonModule,
    AccionesRoutingModule,
    InlineSVGModule,
    GUIModule,
    FormsModule
  ]
})
export class AccionesModule { }
