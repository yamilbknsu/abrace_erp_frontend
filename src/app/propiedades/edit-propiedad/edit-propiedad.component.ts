import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Direccion } from 'src/app/models/Direccion';
import { Persona } from 'src/app/models/Persona';
import { Propiedad } from 'src/app/models/Propiedad';
import { DireccionesService } from 'src/app/services/direcciones.service';
import { PersonasService } from 'src/app/services/personas.service';
import { Location } from '@angular/common';
import { PropiedadesService } from '../propiedades.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-propiedad',
  templateUrl: './edit-propiedad.component.html',
  styleUrls: ['./edit-propiedad.component.css']
})
export class EditPropiedadComponent implements OnInit {

  propiedad: Propiedad;
  _propiedad: Propiedad;

  personas$: BehaviorSubject<Persona[]>;
  direcciones$: BehaviorSubject<Direccion[]>;

  //mandanteId: string;
  mandanteId$: BehaviorSubject<string>;
  mandante = {};

  administradorId$: BehaviorSubject<string>;
  administrador = {};

  direccionId$: BehaviorSubject<string>;
  direccion = {};

  newPropiedad: boolean = false;

  constructor(private route: ActivatedRoute, private personasService: PersonasService,
              private direccionesService: DireccionesService, private router: Router, private _location: Location,
              private propiedadService: PropiedadesService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.personasService.loadPersonasFromBackend();
    this.personas$ = this.personasService.getPersonas();

    this.direccionesService.loadDireccionesFromBackend();
    this.direcciones$ = this.direccionesService.getDirecciones$();

    this.route.data.subscribe((data: {propiedad: Propiedad}) => {
      if (!data.propiedad._id || data.propiedad._id == ''){
        this.newPropiedad = true;
      }

      this.propiedad = data.propiedad;
      this._propiedad = {...this.propiedad};

      if(!this._propiedad.caracteristicas) this._propiedad.caracteristicas = {};
      if(!this._propiedad.telefonos) this._propiedad.telefonos = [];

      this.mandanteId$ = new BehaviorSubject<string>(this._propiedad.mandante);
      this.administradorId$ = new BehaviorSubject<string>(this._propiedad.administrador ? this._propiedad.administrador : "");
      this.direccionId$ = new BehaviorSubject<string>(this._propiedad.direccion);
    });

    combineLatest(this.mandanteId$, this.personas$).pipe(
      map(([mandanteId, personas]) => personas.filter(per => per._id == mandanteId))
    ).subscribe(x => {
      if (x[0] != undefined){
        this.mandante = x[0]
      }else{
        this.mandante = {}
      }
    });

    combineLatest(this.administradorId$, this.personas$).pipe(
      map(([administradorId, personas]) => personas.filter(per => per._id == administradorId))
    ).subscribe(x => {
      if (x[0] != undefined){
        this.administrador = x[0]
      }else{
        this.administrador = {}
      }
    });

    combineLatest(this.direccionId$, this.direcciones$).pipe(
      map(([direccionId, direcciones]) => direcciones.filter(dir => dir._id == direccionId))
    ).subscribe(x => {
      if (x[0] != undefined){
        this.direccion = x[0]
      }else{
        this.direccion = {}
      }
    });

  }

  onBackClicked(){
    this._location.back();
  }

  onGuardarClicked(){
    if(!this.newPropiedad)
      this.propiedadService.updatePropiedad$(this._propiedad)
        .subscribe(() => {
          this.toastService.success('Operación realizada con éxito');
          this.propiedadService.loadPropiedadesFromBackend();
          this.onBackClicked();
        });
    else 
      this.propiedadService.createPropiedad$(this._propiedad)
          .subscribe(() => {
            this.toastService.success('Operación realizada con éxito');
            this.propiedadService.loadPropiedadesFromBackend();
            this.onBackClicked();
          });
  }

  print(){
    console.log(this._propiedad)
  }
}