import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoadingIconService } from './loading-icon.service';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenIntercerptorService implements HttpInterceptor {

  constructor(private loadingIconService: LoadingIconService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = localStorage.getItem('id_token');
    
    this.loadingIconService.isLoading.next(true);

    if (token){
      req = req.clone({
        setHeaders:{
          'auth-token': token
        }
      });
    }

    return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
        this.loadingIconService.isLoading.next(false);
        console.log('Caught: ', error);
        return throwError(error);
      }),
      tap((httpEvent: any) => {
        // Skip request
        if(httpEvent.type === 0){
          return;
        }
        if (httpEvent instanceof HttpResponse) {
          this.loadingIconService.isLoading.next(false);
          localStorage.setItem('id_token', httpEvent.headers.get('auth-token'));
        }
      })
    );
  }
}
