import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoadingIconService } from './loading-icon.service';
import { ToastService } from './toast.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenIntercerptorService implements HttpInterceptor {

  constructor(private loadingIconService: LoadingIconService, private toastService: ToastService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = localStorage.getItem('id_token');
    let userid = localStorage.getItem('current_userid');
    //console.log(userid)
    this.loadingIconService.isLoading.next(true);

    if (token){
      req = req.clone({
        setHeaders:{
          'auth-token': token,
          'logged_as_id': userid ? userid : undefined
        }
      });
    }

    return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
        this.loadingIconService.isLoading.next(false);

        if(error.status == 401){
          this.toastService.error('No tienes permiso para realizar esta acción.');
          return EMPTY;
        }
        if(error.status == 403){
          this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
          return EMPTY;
        }else{
          console.log('error:', error)
          var message = 'Error (' + error.status + '): ';
          if (error.error)
             message += (error.error.details ? error.error.details[0].message: error.error.message);
          this.toastService.error(message)
          return EMPTY;
        }

        //console.log('Caught: ', error);
        //return throwError(error);
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
