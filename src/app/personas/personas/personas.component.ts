import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Persona } from 'src/app/models/Persona';
import { PersonasService } from 'src/app/services/personas.service';
import { SearchBarService } from 'src/app/services/serach-bar.service';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.css']
})
export class PersonasComponent implements OnInit, OnDestroy {

  @Input() isArrendatarios = false;

  personas$: BehaviorSubject<Persona[]> = new BehaviorSubject<Persona[]>([]);
  statusText: string;

  searchText: string = '';

  routerSubscription;
  querySubscription;

  constructor(private personaService: PersonasService,private router: Router,
    private route: ActivatedRoute, private searchBarService: SearchBarService) {
      this.routerSubscription = this.router.events.subscribe((event) => {
        //console.log(event);
        if (event instanceof NavigationEnd) {
          if(this.route.firstChild){
            var url = this.route.firstChild.snapshot.url;
            if (url[0].path == 'edit'){
              this.statusText = '/ Editar';
            }
          }else{
            this.statusText = '';       
          }
        }
      });

      this.querySubscription = this.route.queryParams.subscribe(params => {
        if (params['ismandante']){
          this.isArrendatarios = params['ismandante'] == 'false'
        }
      });
    }

  ngOnInit(): void {
    this.personaService.loadPersonasFromBackend();
    this.personaService.getPersonas().pipe(
      map(personas => personas.filter(p => p.ismandante == !this.isArrendatarios))
      ).subscribe(personas => this.personas$.next(personas));
    //this.personaService.getPersonas().pipe(
    //  map(results => results.sort((a,b) => a.nombre < b.nombre ? -1 : 1))
    //).subscribe(personas => this.personas$.next(personas));

    this.searchBarService.getSearchInput$().subscribe((text) => this.searchText = text);
  }

  ngOnDestroy(){
    this.routerSubscription.unsubscribe();
  }

}
