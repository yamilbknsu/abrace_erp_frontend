import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArrendatariosRoutingModule } from './arrendatarios-routing.module';
import { ArrendatariosComponent } from './arrendatarios/arrendatarios.component';
import { PersonasModule } from '../personas/personas.module';


@NgModule({
  declarations: [ArrendatariosComponent],
  imports: [
    CommonModule,
    ArrendatariosRoutingModule,
    PersonasModule
  ]
})
export class ArrendatariosModule { }
