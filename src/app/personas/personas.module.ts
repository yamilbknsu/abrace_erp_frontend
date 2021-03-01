import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonasRoutingModule } from './personas-routing.module';
import { PersonasComponent } from './personas/personas.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { GUIModule } from '../gui/gui.module';
import { EditPersonaComponent } from './edit-persona/edit-persona.component';
import { FormsModule } from '@angular/forms';
import { personaSearchPipe } from './persona-search-filter.pipe';


@NgModule({
  declarations: [PersonasComponent, EditPersonaComponent,
    personaSearchPipe],
  imports: [
    CommonModule,
    PersonasRoutingModule,
    InlineSVGModule,
    GUIModule,
    FormsModule
  ]
})
export class PersonasModule { }
