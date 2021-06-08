import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
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
import { VerticalNavbarComponent } from './components/vertical-navbar/vertical-navbar.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { GUIModule } from './gui/gui.module';
import { DireccionesComponent } from './components/direcciones/direcciones.component';
import { direccionSearchPipe } from './components/direcciones/direccion-search-filter.service';
import { GlobalErrorHandler } from './services/global-error-handler.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    LogInScreenComponent,
    MainViewComponent,
    VerticalNavbarComponent,
    TopBarComponent,
    DireccionesComponent,
    direccionSearchPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    InlineSVGModule,
    GUIModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenIntercerptorService,
      multi: true
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
    //{provide: ErrorHandler, useClass: GlobalErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
