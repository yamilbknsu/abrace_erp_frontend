import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contrato } from 'src/app/models/Contrato';
import { PropiedadesService } from '../propiedades.service';
import * as moment from 'moment';
import { PersonasService } from 'src/app/services/personas.service';
import { Persona } from 'src/app/models/Persona';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { Location } from '@angular/common';
import { ToastService } from 'src/app/services/toast.service';
import { Propiedad } from 'src/app/models/Propiedad';

@Component({
  selector: 'app-edit-contrato',
  templateUrl: './edit-contrato.component.html',
  styleUrls: ['./edit-contrato.component.css']
})
export class EditContratoComponent implements OnInit, OnDestroy {

  contratoSelected: any = {};
  contratos$: BehaviorSubject<Contrato[]> = new BehaviorSubject<Contrato[]>([]);
  contratoId$: BehaviorSubject<String> = new BehaviorSubject<String>('');
  boletas: any[] = [];
  nextBoleta: any = {};

  propiedad$: BehaviorSubject<Propiedad> = new BehaviorSubject<Propiedad>(new Propiedad());

  personas$: BehaviorSubject<Persona[]> = new BehaviorSubject<Persona[]>([]);
  arrendatarioData = {};
  arrendatarioId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  avalData = {};
  avalId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  oldID = '';

  estadoContrato$;
  tipoContrato$;
  plazos$;
  bancos$;
  monedas$;

  newContrato = false;
  inicioPlaceholder;
  terminoPlaceholder;
  inicioDisplay;
  terminoDisplay;
  reajustePlaceholder;
  reajusteDisplay;

  datePickerConfig = {
    locale: 'es'
  };

  statusText: string;
  routerSubscription;
  querySubscription;

  selectedInstruccion: number;
  instruccionesNombres = [];

  constructor(private propiedadesService: PropiedadesService, private route: ActivatedRoute,
    private personasService: PersonasService, private parametrosService: ParametrosService,
    private _location: Location, private router: Router, private toastService: ToastService,
    private cd: ChangeDetectorRef) {
    this.routerSubscription = this.router.events.subscribe((event) => {
      //console.log(event);
      if (event instanceof NavigationEnd) {
        if (this.route.firstChild) {
          var url = this.route.firstChild.snapshot.url;
          if (url[0].path == 'recibos') {
            this.statusText = '/ Recibos';
          }
        } else {
          this.statusText = '';
        }
      }
    });
  }

  ngOnInit(): void {

    this.personas$ = this.personasService.personas$;
    this.personasService.loadPersonasFromBackend();

    this.inicioPlaceholder = moment();
    this.terminoPlaceholder = moment();
    this.inicioDisplay = moment();
    this.terminoDisplay = '';

    this.querySubscription = this.route.queryParams.subscribe(params => {
      this.propiedadesService.getPropiedad(params['id']).subscribe(p => this.propiedad$.next(p));

      this.propiedadesService.loadContratos(params['id'])
        .subscribe(res => {
          if (res && res?.length) {
            this.contratos$.next(res.sort((a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? -1 : 1));
            if (res.length > 0) this.contratoId$.next(res[0]._id)
          }
        });
    });

    combineLatest(this.contratos$, this.contratoId$)
      .pipe(map(([contratos, id]) => contratos.filter(contrato => contrato._id == id)))
      .subscribe(contrato => {
        if (contrato?.[0]) {
          this.contratoSelected = { ...contrato[0] };

          this.contratoSelected.fechacontrato = new Date(this.contratoSelected.fechacontrato);
          this.inicioPlaceholder = moment(this.contratoSelected.fechacontrato);
          this.inicioDisplay = moment(this.contratoSelected.fechacontrato);

          if (!this.contratoSelected.fechatermino) {
            this.terminoPlaceholder = undefined;
          } else {
            this.contratoSelected.fechatermino = new Date(this.contratoSelected.fechatermino);
            this.terminoPlaceholder = moment(this.contratoSelected.fechatermino);
            this.terminoDisplay = moment(this.contratoSelected.fechatermino);
          }

          if (!this.contratoSelected.proximoreajuste)
            this.reajustePlaceholder = undefined;
          else {
            this.contratoSelected.proximoreajuste = new Date(this.contratoSelected.proximoreajuste);
            this.reajustePlaceholder = moment(this.contratoSelected.proximoreajuste).locale('es');
            //this.reajustePlaceholder = moment(this.contratoSelected.proximoreajuste).locale('es');
          }

          this.arrendatarioId$.next(this.contratoSelected.arrendatario);
          this.avalId$.next(this.contratoSelected.aval);


          this.propiedadesService.loadRecibosContrato(this.contratoSelected._id)
            .subscribe((boletas) => {
              this.boletas = boletas.filter(b => b.tipo != 'Manual' && b.tipo != 'Cancelado')
                .sort((a, b) => (new Date(a.fecha) > new Date(b.fecha)) ? -1 : 1);
              this.nextBoleta = this.propiedadesService.computeNextBoleta(this.contratoSelected, this.boletas[0]);
              this.cd.detectChanges();
            });
          
          this.selectedInstruccion = -1;
          this.instruccionesNombres = this.contratoSelected.instrucciones.map(i => i.nombre);

        } else if (this.contratoId$.value == 'new') {
          this.contratoSelected = this.createContrato();
          this.inicioPlaceholder = moment(this.contratoSelected.fechacontrato);
          this.inicioDisplay = moment(this.contratoSelected.fechacontrato);

          if (!this.contratoSelected.fechatermino)
            this.terminoPlaceholder = undefined;
          else {
            this.contratoSelected.fechatermino = new Date(this.contratoSelected.fechatermino);
            this.terminoPlaceholder = moment(this.contratoSelected.fechatermino);
            this.terminoDisplay = moment(this.contratoSelected.fechatermino);
          }

          if (!this.contratoSelected.proximoreajuste)
            this.reajustePlaceholder = '';
          else {
            this.contratoSelected.proximoreajuste = new Date(this.contratoSelected.proximoreajuste);
            this.reajustePlaceholder = moment(this.contratoSelected.proximoreajuste).locale('es');
            //this.reajustePlaceholder = moment(this.contratoSelected.proximoreajuste).locale('es');
          }

          this.arrendatarioId$.next(this.contratoSelected.arrendatario);
          this.avalId$.next(this.contratoSelected.aval);

          this.selectedInstruccion = -1;
          this.instruccionesNombres = [];
        } else {
          this.selectedInstruccion = -1;
          this.contratoSelected = new Contrato();
          this.instruccionesNombres = [];
        }
      });

    combineLatest(this.arrendatarioId$, this.personas$).pipe(
      map(([arrendatarioId, personas]) => personas.filter(per => per._id == arrendatarioId))
    ).subscribe(x => {
      if (x[0] != undefined) {
        this.arrendatarioData = x[0]
      } else {
        this.arrendatarioData = {}
      }
    });

    combineLatest(this.avalId$, this.personas$).pipe(
      map(([avalId, personas]) => personas.filter(per => per._id == avalId))
    ).subscribe(x => {
      if (x[0] != undefined) {
        this.avalData = x[0]
      } else {
        this.avalData = {}
      }
    });

    this.parametrosService.loadEstadoContratoFromBackend();
    this.parametrosService.loadTipoContratoFromBackend();
    this.parametrosService.loadPlazosFromBackend();
    this.parametrosService.loadBancosFromBackend();
    this.parametrosService.loadMonedasFromBackend();

    this.tipoContrato$ = this.parametrosService.tipoContrato$.pipe(
      map(tipos => tipos.map((tipo) => { return { name: tipo } }))
    );

    this.estadoContrato$ = this.parametrosService.estadoContrato$.pipe(
      map(estados => estados.map((estado) => { return { name: estado } }))
    );

    this.plazos$ = this.parametrosService.plazos$.pipe(
      map(plazos => plazos.map((plazo) => { return { name: plazo } }))
    );

    this.bancos$ = this.parametrosService.bancos$.pipe(
      map(bancos => bancos.map((banco) => { return { name: banco } }))
    );

    this.monedas$ = this.parametrosService.monedas$.pipe(
      map(monedas => monedas.map((moneda) => { return { name: moneda } }))
    );
  }

  ngOnDestroy() {
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

  historialClass(id) {
    return { 'historial-item': true, 'selected': this.contratoId$.value == id }
  }

  selectContrato(id) {
    this.contratoId$.next(id);
  }

  deleteContrato(id) {
    console.log(id)
    this.toastService.confirmation('¿Deseas eliminar este contrato?', (event, response) => {
      if (response == 0) {
        this.propiedadesService.deleteContrato(id).subscribe(() => {
          this.propiedadesService.deleteBoletas(id)
            .subscribe(() => {
              this.toastService.success('Operación realizada con éxito');
              this.propiedadesService.loadContratos(this.propiedad$.value._id)
                .subscribe(res => {
                  if (res) {
                    this.contratos$.next(res.sort((a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? -1 : 1));
                    if (res.length > 0) this.contratoId$.next(res[0]._id)
                  }

                  this.cd.detectChanges();
                });
            });
        });
      }
    });
  }

  changeInstruccionSelected(number){
    this.selectedInstruccion = number;
  }

  updateInstrucciones(items){
    if(!this.contratoSelected?.instrucciones) this.contratoSelected.instrucciones = [];

    items.forEach(element => {
      if(this.contratoSelected.instrucciones?.filter(e => e.nombre == element).length == 0){
        this.contratoSelected.instrucciones.push({nombre: element, detalle: ''})
      }
    });

    this.contratoSelected.instrucciones?.forEach(element => {
      if(!items.includes(element.nombre)){
        const index = this.contratoSelected.instrucciones.map(e => e.nombre).indexOf(element.nombre);
        if (index > -1) {
          this.contratoSelected.instrucciones.splice(index, 1);
        }
      }
    });
    
    if(this.selectedInstruccion >= this.contratoSelected.instrucciones.length){
      this.selectedInstruccion = this.contratoSelected.instrucciones.length - 1;
    }
  }

  updateInicio() {
    //console.log(this.inicioPlaceholder, this.inicioDisplay, this.contratoSelected.fechacontrato)
    if (this.inicioPlaceholder)
      this.contratoSelected.fechacontrato = this.inicioPlaceholder.toDate()

  }

  updateTermino() {
    if (this.terminoPlaceholder)
      this.contratoSelected.fechatermino = this.terminoPlaceholder.toDate()
  }

  updateReajuste() {
    //if(this.reajustePlaceholder)
    //  this.contratoSelected.primerreajuste = this.reajustePlaceholder.toDate()
  }

  checkFechaTermino(date) {
    return date
    //return date > new Date(1970, 0, 1);
  }

  onBackClicked() {
    if (this.newContrato && this.oldID && this.oldID != '') {
      this.contratoId$.next(this.oldID)
      this.newContrato = false
    } else {
      this.propiedadesService.loadPropiedadesFromBackend();
      this._location.back();
    }
  }

  onGuardarClicked() {
    if (!this.newContrato)
      this.propiedadesService.updateContrato(this.contratoSelected)
        .subscribe(() => {
          this.toastService.success('Operación realizada con éxito');
          //this.onBackClicked();
        });
    else {
      // Calcular primer reajuste
      this.toastService.confirmation('Se va a cerrar el contrato anterior y crear uno nuevo, ¿Deseas continuar?', (event, response) => {
        if (response == 0) {
          this.contratoSelected.canonactual = this.contratoSelected.canoninicial;
          switch (this.contratoSelected.tiemporeajuste) {
            case 'Anual':
              this.contratoSelected.proximoreajuste = moment(this.contratoSelected.fechacontrato).add(1, 'year');
              break;
            case 'Trimestral':
              this.contratoSelected.proximoreajuste = moment(this.contratoSelected.fechacontrato).add(3, 'months');
              break;
            case 'Semestral':
              this.contratoSelected.proximoreajuste = moment(this.contratoSelected.fechacontrato).add(6, 'months');
              break;
            case 'Mensual':
              this.contratoSelected.proximoreajuste = moment(this.contratoSelected.fechacontrato).add(1, 'months');
              break;
          }

          this.propiedadesService.createContrato(this.contratoSelected)
            .subscribe((data) => {
              // Create boleta
              this.propiedadesService.writeBoleta(
                {
                  "contrato": data.dataid,
                  "userid": this.contratoSelected.userid,
                  "fecha": this.contratoSelected.fechacontrato,
                  "valorinicial": this.contratoSelected.canoninicial,
                  "valorfinal": this.contratoSelected.canonactual,
                  "estado": "Emitido",
                  "tipo": "Inicial"
                }
              ).subscribe(() => {
                if (this.oldID && this.oldID != '')
                  this.propiedadesService.closeContrato(this.oldID, new Date(this.contratoSelected.fechacontrato))
                    .subscribe(() => {
                      this.toastService.success('Operación realizada con éxito');
                      this.newContrato = false;
                      this.propiedadesService.loadContratos(this.propiedad$.value._id)
                        .subscribe(res => {
                          if (res && res?.length) {
                            this.contratos$.next(res.sort((a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? -1 : 1));
                            if (res.length > 0) this.contratoId$.next(res[0]._id)
                          }
                        });
                      this.cd.detectChanges();
                    });
                else {
                  this.toastService.success('Operación realizada con éxito');
                  this.newContrato = false;
                  this.propiedadesService.loadContratos(this.propiedad$.value._id)
                    .subscribe(res => {
                      if (res && res?.length) {
                        this.contratos$.next(res.sort((a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? -1 : 1));
                        if (res.length > 0) this.contratoId$.next(res[0]._id)
                      }
                    });
                  this.cd.detectChanges();
                }
              });
            });


        }
      });
    }
  }

  createContrato() {
    return {
      propiedad: this.propiedad$.value._id,
      estado: 'Vigente',
      fechacontrato: moment().toDate(),
      tipocontrato: 'Indefinido',
      moneda: 'CLP',
      canoninicial: '0',
      //canonactual: '765000',
      tiempoarriendo: 'Mensual',
      tiemporeajuste: 'Anual',
      diavcto: '1',
      mesgarantia: '0',
      otras: '',
      tipogarantia: '',
      banco: '',
      nrodcto: '',
      arrendatario: '',
      aval: '',
      userid: this.propiedad$.value.userid,
      //proximoreajuste: '2020-10-18T03:00:00.000Z'
    }
  }

  addContrato() {
    this.oldID = this.contratoSelected._id;
    this.newContrato = true;
    this.contratoId$.next('new');
  }

  terminarContrato() {
    this.toastService.confirmation('Se va a marcar el contrato como cerrado, ¿Deseas continuar?', (event, response) => {
      if (response == 0) {
        this.propiedadesService.closeContrato(this.contratoSelected._id, moment().toDate())
          .subscribe(() => {
            this.toastService.success('Operación realizada con éxito');
            this.propiedadesService.loadContratos(this.propiedad$.value._id);
            window.location.reload();
          });
      }
    });
  }

}
