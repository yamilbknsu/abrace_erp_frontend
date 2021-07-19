import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings }from '../appSettings';
import * as moment from "moment";

import { User } from '../models/User';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  backendUrl: string = AppSettings.API_ENDPOINT + 'auth/';
  //users = [];

  constructor(private http:HttpClient, private queryService: QueryService) { }

  attemptLogin(username: string, pwd: string):Observable<any>{
    return this.http.post<any>(`${this.backendUrl}login`, {"username":username, "password":pwd})
  }

  loadUsers(){
    return this.queryService.executeGetQuery('auth', 'users', {}, {})
        //.subscribe(users => {console.log(users); this.users = users})
  }

  public setSession(authResult) {
    const expiresAt = moment().add(authResult.expiresIn,'second');
    
    localStorage.setItem('id_token', authResult.token);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));

    // Setting visible values
    localStorage.setItem('logged_as', authResult.displayname);
    localStorage.setItem('permissions', authResult.permissions);
    localStorage.setItem('inflinea1', authResult.inflinea1);
    localStorage.setItem('inflinea2', authResult.inflinea2);

    // Set variables related to authentication
    localStorage.setItem('real_id', authResult.userid);
    localStorage.setItem('current_userid', authResult.userid);
  }
  
  public clearSession(){
    localStorage.setItem('id_token', undefined);
    localStorage.setItem("expires_at", undefined);

    // Setting visible values
    localStorage.setItem('logged_as', undefined);

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

  public getPermissions(){
    return localStorage.getItem('permissions');
  }

  public getLineasInf(){
    return [localStorage.getItem('inflinea1'), localStorage.getItem('inflinea2')];
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
