import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditPropiedadComponent } from './components/edit-propiedad/edit-propiedad.component';
import { LogInScreenComponent } from './components/log-in-screen/log-in-screen.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { PropiedadesComponent } from './components/propiedades/propiedades.component';

const routes: Routes = [
  {path: 'login', component: LogInScreenComponent},
  {path: 'main-view', component: MainViewComponent,
   children:[
     {
       path: 'propiedades',
       component: PropiedadesComponent
     }
   ]},
  { path: '',   redirectTo: '/login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
