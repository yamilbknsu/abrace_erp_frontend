import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParametrosRoutingModule } from './parametros-routing.module';
import { InlineSVGModule } from 'ng-inline-svg';
import { GUIModule } from '../gui/gui.module';
import { FormsModule } from '@angular/forms';
import { ParametrosComponent } from './parametros/parametros.component';
import { RegionesComponent } from './regiones/regiones.component';


@NgModule({
  declarations: [ParametrosComponent, RegionesComponent],
  imports: [
    CommonModule,
    ParametrosRoutingModule,
    InlineSVGModule,
    GUIModule,
    FormsModule
  ]
})
export class ParametrosModule { }
