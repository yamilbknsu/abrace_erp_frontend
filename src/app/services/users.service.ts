import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings }from '../appSettings';
import * as moment from "moment";

import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  backendUrl: string = AppSettings.API_ENDPOINT + 'auth/';

  constructor(private http:HttpClient) { }

  attemptLogin(username: string, pwd: string):Observable<any>{
    return this.http.post<any>(`${this.backendUrl}login`, {"username":username, "password":pwd})
  }

  public setSession(authResult) {
    const expiresAt = moment().add(authResult.expiresIn,'second');

    localStorage.setItem('id_token', authResult.token);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));

    // Setting visible values
    localStorage.setItem('logged_as', authResult.displayname);
  }          

  logout() {
      localStorage.removeItem("id_token");
      localStorage.removeItem("expires_at");
  }

  public isLoggedIn() {
      return moment().isBefore(this.getExpiration());
  }

  public getDisplayName(){
    return localStorage.getItem('logged_as');
  }

  isLoggedOut() {
      return !this.isLoggedIn();
  }

  getExpiration() {
      const expiration = localStorage.getItem("expires_at");
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
  }
}
