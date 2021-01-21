import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings }from '../appSettings';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  constructor(private http:HttpClient) { }

  executeGetQuery(action: string, collection: string, body, params){
    
    var queryParams = '?' + Object.keys(params).map(function(key) {
      return key + '=' + params[key];
    }).join('&');

    return this.http.get<any>(`${AppSettings.API_ENDPOINT}${action}/${collection}${queryParams}`)
  }

}
