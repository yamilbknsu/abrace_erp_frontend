import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditContratoComponent } from './edit-contrato/edit-contrato.component';
import { EditMandatoComponent } from './edit-mandato/edit-mandato.component';
import { EditPropiedadComponent } from './edit-propiedad/edit-propiedad.component';
import { PropiedadesIdResolverService } from './propiedades-id-resolver.service';
import { PropiedadesComponent } from './propiedades/propiedades.component';

const routes: Routes = [
  {path: '',
   component: PropiedadesComponent,
   children: [
    {
        path: 'edit',
        component: EditPropiedadComponent,
        resolve: {
          propiedad: PropiedadesIdResolverService
        }
      },
      {
        path: 'mandato',
        component: EditMandatoComponent,
        resolve: {
          propiedad: PropiedadesIdResolverService
        }
      },
      {
        path: 'contrato',
        component:EditContratoComponent,
        resolve: {
          
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropiedadesRoutingModule { }