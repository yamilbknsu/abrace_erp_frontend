import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Mandato } from 'src/app/models/Mandato';
import { Propiedad } from 'src/app/models/Propiedad';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { QueryService } from 'src/app/services/query.service';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { PropiedadesService } from '../propiedades.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-mandato',
  templateUrl: './edit-mandato.component.html',
  styleUrls: ['./edit-mandato.component.css']
})
export class EditMandatoComponent implements OnInit {

  mandatos$: BehaviorSubject<Mandato[]> = new BehaviorSubject<Mandato[]>([]);
  mandatoId$: BehaviorSubject<String> = new BehaviorSubject<String>('');
  propiedad: Propiedad;

  mandatoSelected: Mandato;

  selectedInstruccion: number;
  instruccionesNombres = [];

  formasPago$;
  funcionComision$;
  bancos$;

  datePickerConfig = {
    locale: 'es'
  };

  inicioPlaceholder;
  inicioDisplay;
  terminoPlaceholder;
  terminoDisplay;

  constructor(private route: ActivatedRoute, private queryService: QueryService,
              private parametrosService: ParametrosService, private _location: Location,
              private propiedadService: PropiedadesService, private toastService:ToastService) { }

  ngOnInit(): void {
    this.route.data.subscribe((data: {propiedad: Propiedad}) => {
    this.propiedad = data.propiedad;

    this.inicioPlaceholder = moment();
    this.terminoPlaceholder = moment();
    this.inicioDisplay = moment();

    combineLatest(this.mandatos$,this.mandatoId$).pipe(
      map(([mandatos, mandatoId]) => mandatos.filter(mandato => mandato._id == mandatoId))
    ).subscribe((mandato) => {
      if(mandato[0]){
        this.mandatoSelected = {...mandato[0]};
        //console.log(this.mandatoSelected);

        this.mandatoSelected.fechaInicio = new Date(this.mandatoSelected.fechaInicio);
        this.inicioPlaceholder = moment(this.mandatoSelected.fechaInicio);
        this.inicioDisplay = moment(this.mandatoSelected.fechaInicio);

        //this.mandatoSelected.fechaTermino = new Date(1970,0,1);
        if(!this.mandatoSelected.fechaTermino) 
          this.terminoPlaceholder = undefined;
        else{
          this.mandatoSelected.fechaTermino = new Date(this.mandatoSelected.fechaTermino);
          this.terminoPlaceholder = moment(this.mandatoSelected.fechaTermino);
          this.terminoDisplay = moment(this.mandatoSelected.fechaTermino);
        }
        
        this.mandatoSelected.comisiones.admimpuestoincluido = this.mandatoSelected.comisiones.admimpuestoincluido === 'true' || this.mandatoSelected.comisiones.admimpuestoincluido === true;
        this.mandatoSelected.comisiones.contratoimpuestoincluido = this.mandatoSelected.comisiones.contratoimpuestoincluido === 'true' || this.mandatoSelected.comisiones.contratoimpuestoincluido === true;

        if(!this.mandatoSelected.contribuciones) this.mandatoSelected.contribuciones = false;
        if(!this.mandatoSelected.contribucionesdesc) this.mandatoSelected.contribucionesdesc = '';
        if(!this.mandatoSelected.aseo) this.mandatoSelected.aseo = false;
        if(!this.mandatoSelected.aseodesc) this.mandatoSelected.aseodesc = '';
        if(!this.mandatoSelected.otro) this.mandatoSelected.otro = false;
        if(!this.mandatoSelected.otrodesc) this.mandatoSelected.otrodesc = '';

        //if (this.mandatoSelected.instrucciones.length > 0) this.selectedInstruccion = 0;
        //else this.selectedInstruccion = -1;
        this.selectedInstruccion = -1;

        this.instruccionesNombres = this.mandatoSelected.instrucciones.map(i => i.nombre);
      }else{
        this.mandatoSelected = new Mandato('', '', '', new Date());
      }
    });

      this.loadMandatos();
    });

    this.parametrosService.loadFormasPagoFromBackend();

    this.formasPago$ = this.parametrosService.formasPago$.pipe(
      map(pagos => pagos.map((pago) => { return {name: pago}}))
    );

    this.parametrosService.loadFormasFuncionComisionFromBackend();

    this.funcionComision$ = this.parametrosService.funcionComision$.pipe(
      map(pagos => pagos.map((pago) => { return {name: pago}}))
    );

    
    this.parametrosService.loadBancosFromBackend();
    this.bancos$ = this.parametrosService.bancos$.pipe(
      map(bancos => bancos.map((banco) => { return { name: banco } }))
    );
  }

  updateInstrucciones(items){
    items.forEach(element => {
      if(this.mandatoSelected.instrucciones.filter(e => e.nombre == element).length == 0){
        this.mandatoSelected.instrucciones.push({nombre: element, detalle: ''})
      }
    });

    this.mandatoSelected.instrucciones.forEach(element => {
      if(!items.includes(element.nombre)){
        const index = this.mandatoSelected.instrucciones.map(e => e.nombre).indexOf(element.nombre);
        if (index > -1) {
          this.mandatoSelected.instrucciones.splice(index, 1);
        }
      }
    });
    
    if(this.selectedInstruccion >= this.mandatoSelected.instrucciones.length){
      this.selectedInstruccion = this.mandatoSelected.instrucciones.length - 1;
    }
  }

  changeInstruccionSelected(number){
    this.selectedInstruccion = number;
  }

   formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('/');
  }

  checkFechaTermino(date){
    return date
    //return date > new Date(1970, 0, 1);
  }

  onBackClicked(){
    this._location.back();
  }

  updateInicio(){
    if(this.inicioPlaceholder)
      this.mandatoSelected.fechaInicio = this.inicioPlaceholder.toDate()
  }

  updateTermino(){
    if(this.terminoPlaceholder)
      this.mandatoSelected.fechaTermino = this.terminoPlaceholder.toDate()
  }

  removeOtrosDestinatarios(i: number){
    console.log(this.mandatoSelected.otrosdestinatarios)
    this.mandatoSelected.otrosdestinatarios.splice(i, 1);
  }

  addOtrosDestinatarios(){
    this.mandatoSelected.otrosdestinatarios.push({nombre:'', moneda: '', tipocalculo: 'Absoluto', monto: 0, formapago: 'Deposito',
                                                  nrocuenta: '', banco: ''})
  }

  historialClass(id){
    return {'historial-item': true, 'selected': this.mandatoId$.value == id}
  }

  selectMandato(id){
    this.mandatoId$.next(id);
  }

  onGuardarClicked(){
    this.propiedadService.updateMandato$(this.mandatoSelected)
      .subscribe(() => {
        this.toastService.success('Operación realizada con éxito');
        this.propiedadService.loadPropiedadesFromBackend();
        this.onBackClicked();
      });
  }

  onNewClicked(){
    if(this.mandatos$.value[0] && !this.mandatos$.value[0].fechaTermino){
       this.toastService.confirmation('¿Deseas establecer la fecha de termino del último mandato al dia de hoy?', (event, response) => {
          if(response == 0){
            var mandatoAux = {...this.mandatos$.value[0]};
            mandatoAux.fechaTermino = new Date();
            this.propiedadService.updateMandato$(mandatoAux).subscribe(() => {

              this.queryService.executePostQuery('write', 'mandatos', this.newMandato(), {})
                  .pipe(
                    catchError(err => {
                      if (err.status == 403){
                        this.toastService.error('No tienes permiso para realizar esta acción.')
                      }else{
                        console.log(err)
                        var message = err.status + ' ';
                        if (err.error)
                           message += (err.error.details ? err.error.details[0].message: err.error);
                        this.toastService.error('Error desconocido. ' + message)
              
                      }
                      return EMPTY;
                    })
                  ).subscribe(() => {
                    this.toastService.success('Mandato creado con éxito');
                    this.loadMandatos();
                  });
            });
          }
       });
    }else{
      this.queryService.executePostQuery('write', 'mandatos', this.newMandato(), {})
                  .pipe(
                    catchError(err => {
                      if (err.status == 403){
                        this.toastService.error('No tienes permiso para realizar esta acción.')
                      }else{
                        console.log(err)
                        var message = err.status + ' ';
                        if (err.error)
                           message += (err.error.details ? err.error.details[0].message: err.error);
                        this.toastService.error('Error desconocido. ' + message)
              
                      }
                      return EMPTY;
                    })
                  ).subscribe(() => {
                    this.toastService.success('Mandato creado con éxito');
                    this.loadMandatos();
                  });
    }
  }

  newMandato(){
    return {
        "propiedad":  this.propiedad._id,
        "fechaInicio":new Date(),
        "firmacontrato": "Mandante",
        "enviocorresp": "Oficina",
        "liquidacion": {
            "formapago": "Deposito",
            "cuenta": "",
            "banco": "",
            "pagoa": ""
        },
        "comisiones": {
            "tipoadm": "Porcentual",
            "valoradm": "0",
            "tipocontrato": "Porcentual",
            "valorcontrato": "0",
            "incluirhononadmin": "true",
            "impuestoadm": "0",
            "admimpuestoincluido": true,
            "impuestocontrato": "0",
            "contratoimpuestoincluido": false
        },
        "instrucciones": [],
        "otrosdestinatarios": [],
        "userid":this.propiedad.userid
    }
  }

  loadMandatos(){
    this.queryService.executeGetQuery('read', 'mandatos', {}, {propiedad: this.propiedad._id})
                        .subscribe((mandatos) => {
                          this.mandatos$.next(mandatos.sort((a,b) => (new Date(a.fechaInicio) > new Date(b.fechaInicio)) ? -1 : 1));
                          if(mandatos.length > 0)
                            this.mandatoId$.next(mandatos[0]._id);
                        }
                      );
  }

  deleteMandato(id){
    this.toastService.confirmation('Deseas eliminar este mandato?', (event, response) => {
      if(response == 0){
        this.queryService.executeDeleteQuery('delete', 'mandatos', {}, {id})
            .pipe(
              // Catch a Forbidden acces error (return to login).
              catchError(err => {
                if (err.status == 403){
                  this.toastService.error('No tienes permiso para realizar esta acción.')
                }else{
                  console.log(err)
                  var message = err.status + ' ';
                  if (err.error)
                    message += (err.error.details ? err.error.details[0].message: err.error);
                  this.toastService.error('Error desconocido. ' + message)

                }
                return EMPTY;
              })
            ).subscribe(() => {
              this.toastService.success('Operación realizada con éxito');
              this.loadMandatos();
            });
      }
   });
  }
}
