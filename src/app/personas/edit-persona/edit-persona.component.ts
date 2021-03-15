import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Direccion } from 'src/app/models/Direccion';
import { Persona } from 'src/app/models/Persona';
import { DireccionesService } from 'src/app/services/direcciones.service';
import { PersonasService } from 'src/app/services/personas.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-persona',
  templateUrl: './edit-persona.component.html',
  styleUrls: ['./edit-persona.component.css']
})
export class EditPersonaComponent implements OnInit {

  persona: Persona;
  _persona: Persona;

  direcciones$: BehaviorSubject<Direccion[]>;

  dirParticularId$: BehaviorSubject<string>;
  dirParticular = {};

  dirComercialId$: BehaviorSubject<string>;
  dirComercial = {};

  TitleText: string = 'Editar';
  newPerson: boolean = false;

  constructor(private router: Router, private _location: Location,
    private route: ActivatedRoute, private direccionesService: DireccionesService,
    private personasService: PersonasService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.direccionesService.loadDireccionesFromBackend();
    this.direcciones$ = this.direccionesService.getDirecciones$();

    this.route.data.subscribe((data: {persona: Persona}) => {
      //this.persona = data.persona;
      if (data.persona._id == ''){
        this.TitleText = 'Nueva';
        this.newPerson = true;
      }

      this._persona = {...data.persona};

      if(data.persona.telefonos) this._persona.telefonos = [... data.persona.telefonos]
      else this._persona.telefonos = []

      if(data.persona.emails) this._persona.emails = [... data.persona.emails]
      else this._persona.emails = []

      this.dirParticularId$ = new BehaviorSubject<string>(this._persona.dirParticular);
      this.dirComercialId$ = new BehaviorSubject<string>(this._persona.dirComercial);
    });

    combineLatest(this.dirParticularId$, this.direcciones$).pipe(
      map(([direccionId, direcciones]) => direcciones.filter(dir => dir._id == direccionId))
    ).subscribe(x => {
      if (x[0] != undefined){
        this.dirParticular = x[0]
      }else{
        this.dirParticular = {}
      }
    });

    combineLatest(this.dirComercialId$, this.direcciones$).pipe(
      map(([direccionId, direcciones]) => direcciones.filter(dir => dir._id == direccionId))
    ).subscribe(x => {
      if (x[0] != undefined){
        this.dirComercial = x[0]
      }else{
        this.dirComercial = {}
      }
    });
  }

  updateTelefonos(event: Array<string>){
    this._persona.telefonos = event;
  }

  updateEmails(event: Array<string>){
    this._persona.emails = event;
  }

  onBackClicked(){
    this._location.back();
  }

  onDeleteClicked(){
    this.toastService.confirmation('Vas a eliminar la información de esta persona', (event, response) => {
      if(response == 0){
        this.personasService.deletePersona$(this._persona._id).subscribe(()=>{
          this.toastService.success('Operación realizada con éxito');
          this.personasService.loadPersonasFromBackend();
          window.location.reload();
        });
      }
    });
  }

  onGuardarClicked(){
    if (!this.newPerson)
      this.personasService.updatePersona$(this._persona)
        .subscribe(() => {
          this.toastService.success('Operación realizada con éxito');
          this.personasService.loadPersonasFromBackend();
          this.onBackClicked();
        });
    else 
      this.personasService.createPersona$(this._persona)
          .subscribe(() => {
            this.toastService.success('Operación realizada con éxito');
            this.personasService.loadPersonasFromBackend();
            this.onBackClicked();
          });
  }

}