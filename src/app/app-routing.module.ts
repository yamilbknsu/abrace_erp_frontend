import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DireccionIdResolverService } from './components/direcciones/direccion-resolver.service';
import { DireccionesComponent } from './components/direcciones/direcciones.component';
import { LogInScreenComponent } from './components/log-in-screen/log-in-screen.component';
import { MainViewComponent } from './components/main-view/main-view.component';

const routes: Routes = [
  {path: 'login', component: LogInScreenComponent},
  {path: 'main-view', component: MainViewComponent,
   children:[
     {
       path: 'propiedades',
       loadChildren: () => import('./propiedades/propiedades.module').then(m => m.PropiedadesModule)
     },
     {
      path: 'personas',
      loadChildren: () => import('./personas/personas.module').then(m => m.PersonasModule)
     },
     {
       path: 'direccion',
       component: DireccionesComponent,
       resolve: {
         direccionId: DireccionIdResolverService
       }
     },
     {
      path: 'parametros',
      loadChildren: () => import('./parametros/parametros.module').then(m => m.ParametrosModule)
     },
     {
      path: 'informes',
      loadChildren: () => import('./informes/informes.module').then(m => m.InformesModule)
     },
     {
      path: 'acciones',
      loadChildren: () => import('./acciones/acciones.module').then(m => m.AccionesModule)
     },
   ]},
  { path: '',   redirectTo: '/login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
