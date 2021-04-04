import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformesRoutingModule } from './informes-routing.module';
import { InformesComponent } from './informes/informes.component';
import { InfPropiedadesComponent } from './inf-propiedades/inf-propiedades.component';

import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { InfReajustesComponent } from './reajustes/reajustes.component';
import { GUIModule } from '../gui/gui.module';
import { FormsModule } from '@angular/forms';
import { InfPagosComponent } from './inf-pagos/inf-pagos.component';

@NgModule({
  declarations: [InformesComponent, InfPropiedadesComponent, InfReajustesComponent, InfPagosComponent],
  imports: [
    CommonModule,
    InformesRoutingModule,
    PdfJsViewerModule,
    GUIModule,
    FormsModule
  ]
})
export class InformesModule { }
