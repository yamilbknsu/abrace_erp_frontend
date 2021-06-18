import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuariosRoutingModule } from './usuarios-routing.module';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { EditUsuarioComponent } from './edit-usuario/edit-usuario.component';
import { GUIModule } from '../gui/gui.module';
import { FormsModule } from '@angular/forms';
import { EditSelfUserComponent } from '../components/edit-self-user/edit-self-user.component';
import { InlineSVGModule } from 'ng-inline-svg';


@NgModule({
  declarations: [UsuariosComponent, EditUsuarioComponent],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    GUIModule,
    FormsModule,
    InlineSVGModule,
  ],
  exports:[EditUsuarioComponent]
})
export class UsuariosModule { }
