import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Direccion } from 'src/app/models/Direccion';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { DireccionesService } from 'src/app/services/direcciones.service';
import { SearchBarService } from 'src/app/services/serach-bar.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent implements OnInit {

  //idEditing: string = '0';

  direcciones$: BehaviorSubject<Direccion[]>;
  searchText: string = '';
  routerSubscription;

  _direccion;
  direccionId$: BehaviorSubject<string>;

  regiones$;

  statusText = '';

  constructor(private direccionesService: DireccionesService, private toastService: ToastService,
              private route: ActivatedRoute, private searchService: SearchBarService,
              private parametrosService: ParametrosService) { }

  ngOnInit(): void {
    this.direccionesService.loadDireccionesFromBackend();
    this.direcciones$ = this.direccionesService.getDirecciones$();
    this.direccionId$ = new BehaviorSubject<string>('');
    this.direccionId$.subscribe(id =>{
      if(id == '') this.statusText = '';
      else if(id == 'new') this.statusText = ' / Nueva';
      else this.statusText = ' / Editar'
    });

    this.parametrosService.loadRegionesFromBackend();
    this.regiones$ = this.parametrosService.regiones$.pipe(
      map(regiones => regiones.map((reg) => { return {name: reg}}))
    );

    this.routerSubscription = this.route.data.subscribe((data: {direccionId: string}) => {
      if(data.direccionId != ''){
        this.direccionId$.next(data.direccionId);
      }
    });

    

    //this.parametrosService.regiones$.subscribe((reg) => this.regiones = reg);

    combineLatest(this.direccionId$, this.direcciones$).pipe(
      map(([direccionId, direcciones]) => direcciones.filter(dir => dir._id == direccionId))
    ).subscribe(x => {
      if (x[0] != undefined){
        this._direccion = {...x[0]}
      }else{
        this._direccion = {}
      }
    });

    this.searchService.getSearchInput$().subscribe(str => {this.searchText = str})
  }

  direccionesClass(id){
    return {'direccion-item': true, 'selected': id == this.direccionId$.value}
  }

  onClickPropiedad(id){
    this.direccionId$.next(id);
  }

  ngOnDestroy(){
    this.routerSubscription.unsubscribe();
  }

  newDireccion(){
    this.direccionId$.next('new');
  }

  onBackClicked(){
    this.direccionId$.next('');
  }

  onGuardarClicked(){
    if(this.direccionId$.value != 'new')
      this.direccionesService.updateDireccion$(this._direccion)
        .subscribe(() =>{
          this.toastService.success('Operación realizada con éxito');
          this.direccionesService.loadDireccionesFromBackend();
          this.onBackClicked();
        });
    else
      this.direccionesService.createDireccion$(this._direccion)
      .subscribe(() =>{
        this.toastService.success('Operación realizada con éxito');
        this.direccionesService.loadDireccionesFromBackend();
        this.onBackClicked();
      });
  }

  onDeleteClicked(){
    if(this.direccionId$.value != 'new' && this.direccionId$.value != ''){
      this.toastService.confirmation('Vas a eliminar la dirección', (event, response) => {
        if(response == 0){
          this.direccionesService.deleteDireccion$(this.direccionId$.value).subscribe(()=>{
            window.location.reload();
            this.toastService.success('Operación realizada con éxito')
          });
        }
      });
    }
  }

}
