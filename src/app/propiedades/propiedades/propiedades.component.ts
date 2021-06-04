import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PropiedadesService } from '../propiedades.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Propiedad } from 'src/app/models/Propiedad';
import { SearchBarService } from 'src/app/services/serach-bar.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-propiedades',
  templateUrl: './propiedades.component.html',
  styleUrls: ['./propiedades.component.css'],
  host: {
    '(document:click)': 'onClick($event)',
  }
})
export class PropiedadesComponent implements OnInit {

  propiedades$: Observable<Propiedad[]>;

  statusText: string;

  indexSelected: number;
  idEditing: string;

  searchText: string = '';

  // 0: Propiedad
  // 1: Mandato
  editingProperty: number;

  sortingProperty = new BehaviorSubject<string>('uId');
  ascending = true;

  constructor(private _eref: ElementRef, private router: Router,
    private route: ActivatedRoute, private propiedadService: PropiedadesService,
    private searchBarService: SearchBarService, private toastService: ToastService) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.route.firstChild) {
          var url = this.route.firstChild.snapshot.url;
          if (url[0].path == 'edit') {
            this.statusText = '/ Editar';
            this.editingProperty = 0;
          } else if (url[0].path == 'mandato') {
            this.statusText = '/ Mandato';
            this.editingProperty = 1;
          } else if (url[0].path == 'contrato') {
            this.statusText = '/ Contrato';
            this.editingProperty = 2;
          } else if (url[0].path == 'recibos') {
            this.statusText = '/ Recibos';
            this.editingProperty = 3;
          }

        } else {
          this.indexSelected = -1;
          this.idEditing = "0";
          this.statusText = '';
        }
      }
    });
  }

  ngOnInit(): void {
    this.propiedadService.loadPropiedadesFromBackend();
    //this.propiedades$ = this.propiedadService.getPropiedades$()

    this.route.queryParams.subscribe(params => {
      if (params.hasOwnProperty('id')) {
        this.idEditing = params['id'];
      }
    });

    this.searchBarService.getSearchInput$().subscribe((text) => this.searchText = text);

    this.propiedades$ = combineLatest(this.propiedadService.getPropiedades$(), this.sortingProperty, 
                              (propiedades, key) => {
                                if(key == 'mandante')
                                  return propiedades.sort(this.ascending ? ((a:any, b:any) => a.mandanteData.nombre > b.mandanteData.nombre ? 1 : -1) :
                                                                            (a:any, b:any) => a.mandanteData.nombre < b.mandanteData.nombre ? 1 : -1);
                                if(key == 'comuna')
                                  return propiedades.sort(this.ascending ? ((a:any, b:any) => a.direccionData.comuna > b.direccionData.comuna ? 1 : -1) :
                                                                            (a:any, b:any) => a.direccionData.comuna < b.direccionData.comuna ? 1 : -1);
                                if(key == 'estado')
                                  return propiedades.sort(this.ascending ? ((a:any, b:any) => a.estados[0] == 'Arrendada' ? -1 : 1) :
                                                                            (a:any, b:any) =>  a.estados[0] == 'Arrendada' ? 1 : -1);
                                return propiedades.sort(this.ascending ? ((a,b) => a[key] > b[key] ? 1 : -1) : (a,b) => a[key] > b[key] ? -1 : 1)
                              })
  }

  changeSortingProperty(key){
    if(key == this.sortingProperty.value) this.ascending = !this.ascending;
    this.sortingProperty.next(key);
  }

  propiedadesClass(i: number) {
    if (this.idEditing == "0") {
      return { 'propiedad-item': true, 'selected': this.indexSelected == i }
    } else {
      //return {'propiedad-item': true, 'inactive': this.indexEditing != i, 'shadowed':  this.indexEditing == i}
      return { 'propiedad-item': true, 'shadowed': true }
    }
  }

  dotMenuClicked(i: number) {
    this.indexSelected = i;
  }

  onClick(event) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.indexSelected = -1;
    }
  }

  deletePropiedad(id: number) {
    this.indexSelected = -1;
    this.toastService.confirmation('Vas a eliminar propiedad', (event, response) => {
      if (response == 0) {
        this.propiedadService.deletePropiedad$(id).subscribe(() => {
          window.location.reload();
          this.toastService.success('Operación realizada con éxito')
        });
      }
    });
  }

  batchClass(estado) {
    return {
      'batch': true, 'green': estado == 'Arrendada',
      'blue': estado == 'Libre', 'purple': estado == 'En mora'
    }
  }
}
