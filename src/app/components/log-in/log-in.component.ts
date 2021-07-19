import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { trigger, state, style, animate, transition, keyframes, query, stagger } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { BehaviorSubject } from 'rxjs';
import { Propiedad } from 'src/app/models/Propiedad';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
  animations: [
    trigger('onSuccessAnimation', [
      transition('void => *',[
        style({ flex: '0' }),
        animate('.1s', style({ flex: '1' }))
      ]),
      transition('* => void', [
        style({ flex: '1'}),
        animate('.1s', style({ flex: '0' }))
      ])
    ]),

    trigger('buttonCollapse', [
      transition('* => void', [
        style({ flex: '1'}),
        animate('.1s', style({ flex: '0' }))
      ])
    ]),
    
    trigger('onErrorAnimation', [
      transition(':enter', [
        animate('.8s', keyframes([
          style({backgroundColor: 'rgb(255, 50, 50)', offset: .2}),
          style({backgroundColor: 'rgb(230, 0, 0)', offset: 1})
        ]))
      ])
    ]),

    trigger('onAppearStagger', [
      transition(':enter', [
        query('div' , [
          style({ transform: 'translateY(-20px)', opacity: '0' }),
          stagger(150, [ animate('.5s', style({ transform: 'translateY(0px)', opacity: '1'})) ])
        ])
      ])
    ])
  ]
})
export class LogInComponent implements OnInit {

  username: string;
  password: string;


  constructor(private userService: UsersService, private router: Router, private route: ActivatedRoute, private propiedadesService:PropiedadesService) { }

  successful: boolean;
  error: string;

  ngOnInit() {
    this.successful = false;
    this.error = '';

    this.route.queryParams.subscribe(params => {
      this.error = params['expired'] === 'true' ? 'Sesion expirada' : '';
    });

    this.propiedadesService.propiedades$ = new BehaviorSubject<Propiedad[]>([]);
    this.userService.clearSession();
  }

  onClickLogin(){
    //console.log('Attempting log in with crentials', this.username, this.password);
    this.userService.attemptLogin(this.username, this.password)
        .subscribe(
          res => {
            // Save the session on local storage
            this.userService.setSession(res);
            
            // Change the UI
            this.successful = true;
            this.error = '';

            setTimeout(() => this.router.navigate([{ outlets: { primary: 'main-view/propiedades' }}]), 900)

            // logging for debugging purposes
            // console.log(res);
            // console.log(this.userService.getExpiration())
          },
          error => {
            if (error.status == 403) console.log('Forbidden access');
            this.error = error.error.message;
            console.log(error.error.message);
          });
  }
}
