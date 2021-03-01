import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditPersonaComponent } from './edit-persona/edit-persona.component';
import { PersonaIdResolverService } from './persona-id-resolver.service';
import { PersonasComponent } from './personas/personas.component';

const routes: Routes = [
  {path: '', component: PersonasComponent,
   children: [
     {
       path: 'edit',
       component: EditPersonaComponent,
       resolve: {
         persona: PersonaIdResolverService
       }
     }
   ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonasRoutingModule { }
