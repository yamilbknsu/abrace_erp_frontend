import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg';
import { PropiedadesComponent } from './propiedades/propiedades.component';
import { FormsModule } from '@angular/forms';

import { PropiedadesRoutingModule } from './propiedades-routing.module';
import { idPropiedadPipe } from './propiedad-id-filter.pipe';
import { EditPropiedadComponent } from './edit-propiedad/edit-propiedad.component';
import { GUIModule } from '../gui/gui.module';
import { propiedadSearchPipe } from './propiedad-search-filter.pipe';
import { EditMandatoComponent } from './edit-mandato/edit-mandato.component';

@NgModule({
  declarations: [PropiedadesComponent,
                 EditPropiedadComponent,
                 idPropiedadPipe,
                 propiedadSearchPipe,
                 EditMandatoComponent],
  imports: [
    CommonModule,
    PropiedadesRoutingModule,
    InlineSVGModule,
    FormsModule,
    GUIModule
  ]
})
export class PropiedadesModule { }
