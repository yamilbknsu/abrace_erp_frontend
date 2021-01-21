import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InlineSVGModule } from 'ng-inline-svg';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { LogInScreenComponent } from './components/log-in-screen/log-in-screen.component';
import { AuthTokenIntercerptorService } from './services/auth-token-intercerptor.service';
import { MainViewComponent } from './components/main-view/main-view.component';
import { PropiedadesComponent } from './components/propiedades/propiedades.component';
import { VerticalNavbarComponent } from './components/vertical-navbar/vertical-navbar.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { EditPropiedadComponent } from './components/edit-propiedad/edit-propiedad.component';

@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    LogInScreenComponent,
    MainViewComponent,
    PropiedadesComponent,
    VerticalNavbarComponent,
    TopBarComponent,
    EditPropiedadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    InlineSVGModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenIntercerptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
