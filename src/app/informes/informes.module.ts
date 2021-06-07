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
import { InfLiquidacionComponent } from './inf-liquidacion/inf-liquidacion.component';
import { InfEstadoLiquidacionesComponent } from './inf-estado-liquidaciones/inf-estado-liquidaciones.component';
import { InfEstadoArriendosComponent } from './inf-estado-arriendos/inf-estado-arriendos.component';
import { InfEstadoPagosComponent } from './inf-estado-pagos/inf-estado-pagos.component';
import { InfContribucionesComponent } from './inf-contribuciones/inf-contribuciones.component';
import { InfCanonComponent } from './inf-canon/inf-canon.component';

@NgModule({
  declarations: [InformesComponent, InfPropiedadesComponent, InfReajustesComponent, InfPagosComponent, InfLiquidacionComponent, InfEstadoLiquidacionesComponent, InfEstadoArriendosComponent, InfEstadoPagosComponent, InfContribucionesComponent, InfCanonComponent],
  imports: [
    CommonModule,
    InformesRoutingModule,
    PdfJsViewerModule,
    GUIModule,
    FormsModule
  ]
})
export class InformesModule { }
