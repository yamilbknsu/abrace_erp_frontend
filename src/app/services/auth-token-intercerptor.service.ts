import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenIntercerptorService implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = localStorage.getItem('id_token');
    
    if (token){
      req = req.clone({
        setHeaders:{
          'auth-token': token
        }
      });
    }

    return next.handle(req).pipe(
      tap((httpEvent: any) => {
        // Skip request
        if(httpEvent.type === 0){
          return;
        }
        if (httpEvent instanceof HttpResponse) {
          localStorage.setItem('id_token', httpEvent.headers.get('auth-token'));
        }
      })
    );
  }
}
