import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditUsuarioComponent } from './edit-usuario/edit-usuario.component';
import { UsuariosComponent } from './usuarios/usuarios.component';

const routes: Routes = [
  {
    path: '',
    component: UsuariosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }
