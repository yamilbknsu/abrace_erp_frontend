import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsersViewComponent } from './components/users-view/users-view.component';
import { UserItemComponent } from './components/user-item/user-item.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { LogInScreenComponent } from './components/log-in-screen/log-in-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersViewComponent,
    UserItemComponent,
    LogInComponent,
    LogInScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
