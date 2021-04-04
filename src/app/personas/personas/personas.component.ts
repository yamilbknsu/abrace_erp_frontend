import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Persona } from 'src/app/models/Persona';
import { PersonasService } from 'src/app/services/personas.service';
import { SearchBarService } from 'src/app/services/serach-bar.service';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.css']
})
export class PersonasComponent implements OnInit, OnDestroy {

  personas$: BehaviorSubject<Persona[]>;
  statusText: string;

  searchText: string = '';

  routerSubscription;

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
    }

  ngOnInit(): void {
    this.personaService.loadPersonasFromBackend();
    this.personas$ = this.personaService.getPersonas();

    this.searchBarService.getSearchInput$().subscribe((text) => this.searchText = text);
  }

  ngOnDestroy(){
    this.routerSubscription.unsubscribe();
  }

}
