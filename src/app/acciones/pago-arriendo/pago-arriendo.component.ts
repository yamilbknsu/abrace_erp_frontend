import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Propiedad } from 'src/app/models/Propiedad';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { ToastService } from 'src/app/services/toast.service';
import { AccionesService } from '../acciones.service';

@Component({
  selector: 'app-pago-arriendo',
  templateUrl: './pago-arriendo.component.html',
  styleUrls: ['./pago-arriendo.component.css']
})
export class PagoArriendoComponent implements OnInit {

  propiedades: any[] = [];
  boletas: any[] = [];
  nextBoleta = {};
  instrucciones: any[] = [];
  date;
  datePago;
  totalCargos: number = 0;
  totalDescuentos: number = 0;
  subtotal: number = 0;

  selectedPropiedadId: string = '';
  selectedPropiedadId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  selectedContratoId: string = '';
  selectedContratoId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  selectedPropiedad: any = new Propiedad();
  selectedContrato: any = {};

  selectedPago:any = undefined;

  datePickerConfig = {
    locale: 'es'
  }

  tiposCargo: any[] = [{name: 'Pago recurrente'}, {name: 'Otro'}];

  cargos: any[] = [];
  descuentos: any[] = [];

  formaspago: any[] = [{name: 'Transferencia'}, {name: 'Cheque'}, {name: 'Efectivo'}, {name: 'Depósito'}];
  bancos$;
  formapago: string = '';
  documento: string = '';
  banco: string = '';
  depositadoen: string = '';
  bancoen: string = '';

  correspondeArriendo = true;
  cargandoPagos = false;

  constructor(private route: ActivatedRoute, private accionesService: AccionesService,
    private toastService: ToastService, private parametrosService: ParametrosService, private propiedadesService: PropiedadesService) { }

  ngOnInit(): void {
    this.date = moment().startOf('month').locale('es');
    this.datePago = moment();

    this.route.data.subscribe(data => {
      this.propiedades = data.propiedades;
    });

    this.selectedPropiedadId$.subscribe(id => this.selectedPropiedad = this.propiedades.filter(prop => prop._id == id)?.[0]);
    this.selectedContratoId$.subscribe(id => {
      this.selectedContrato = this.propiedades.filter(prop => prop._id == this.selectedPropiedadId)?.[0]?.contratos.filter(cont => cont._id == id)?.[0]
      this.boletas = [];
      this.instrucciones = [];
      if(this.selectedContrato){
        //this.boletas = this.selectedContrato.boletas.map(boleta => {
        //  boleta.formatedFecha = this.formatDate(boleta.fecha);
        //  return boleta
        //});
        
        this.instrucciones = this.selectedContrato.instrucciones;
        this.totalCargos = 0;
        this.totalDescuentos = 0;
        this.subtotal = 0;

        this.changePeriodo();
        //this.nextBoleta = this.propiedadesService.computeNextBoleta(this.selectedContrato, this.boletas[0]);

      }
    });

    
    this.parametrosService.loadBancosFromBackend();
    this.bancos$ = this.parametrosService.bancos$.pipe(
      map(bancos => bancos.map((banco) => { return { name: banco } }))
    );

  }

  changePropiedad(id){
    this.selectedContrato = {};
    this.selectedContratoId = '';
    this.selectedContratoId$.next(this.selectedContratoId);
    if(id) this.selectedPropiedadId$.next(id);
    else this.selectedPropiedadId$.next('');
  }

  changeContrato(id){
    this.date = moment().startOf('month').locale('es');
    if(id) this.selectedContratoId$.next(id);
    else this.selectedContratoId$.next('');
  }

  changeBoleta(i){
    this.cargos[i].valor = this.boletas.filter(boleta => boleta._id == this.cargos[i].concepto)[0]?.valorfinal;
    this.updateTotales();
  }

  changeConcepto(i){
    this.cargos[i].detalle = this.instrucciones.filter(inst => inst.nombre == this.cargos[i].concepto)[0]?.detalle;
  }

  changeTipo(i){
    this.cargos[i].concepto = '';
    this.cargos[i].detalle = '';
    this.cargos[i].valor = 0;
  }

  changePeriodo(){
    this.correspondeArriendo = this.isNextArriendo(this.selectedContrato, this.date);
    
    if(!this.cargandoPagos){
      this.cargos = [];
      this.descuentos = [];
      this.formapago = '';
      this.documento = '';
      this.banco = '';
      this.depositadoen = '';
      this.bancoen = '';
      this.totalCargos = 0;
      this.totalDescuentos = 0;
      this.subtotal = 0;

      this.selectedPago = undefined;

      this.cargandoPagos = true;
      this.accionesService.loadPropiedadesPago({propiedad: this.selectedPropiedadId, contrato: this.selectedContratoId,
        periodo: this.date.toDate()})
          .subscribe((data) => {
            this.cargandoPagos = false;
            console.log(data)
            
            if(data[0]?.contratos[0]?.pagos?.length == 0){
              // Primer pago
              const contfecha = new Date(data[0]?.contratos[0]?.fechacontrato)
              if(contfecha.getMonth() != this.date.toDate().getMonth() || contfecha.getFullYear() != this.date.toDate().getFullYear()){
                this.toastService.error('Debe ingresar el primer mes del contrato! (' + contfecha.toLocaleString('es', { month: 'long' }) + ' ' + contfecha.getUTCFullYear() + ')')
                this.date = moment(contfecha);
              }
              
              this.cargos.push({tipo: 'Arriendo', concepto: '', detalle: 'Primer mes de arriendo', valor: data[0]?.contratos[0]?.canoninicial});
              this.cargos.push({tipo: 'Otro', concepto: 'Mes garantía', detalle: '', valor: data[0]?.contratos[0]?.canoninicial});

              this.updateTotales();
              return
            }

            // Si se recibieron pagos, entonces puede ser el del ultimo mes, o el de este mes
            if(data[0]?.contratos[0]?.pagos?.length == 1){
              const fechapago = moment(data[0]?.contratos[0]?.pagos[0].fechaemision);
              if(fechapago.month() == this.date.month() && fechapago.year() == this.date.year()){
                //this.toastService.error('Ya hay un pago registrado para este mes')
                this.selectedPago = data[0]?.contratos[0]?.pagos[0];


                this.datePago = moment(this.selectedPago.fechapago);
                this.formapago = this.selectedPago.formapago;
                this.documento = this.selectedPago.documento;
                this.banco = this.selectedPago.banco;
                this.depositadoen = this.selectedPago.depositadoen;
                this.bancoen = this.selectedPago.bancoen;
                this.totalCargos = this.selectedPago.totalCargos;
                this.totalDescuentos = this.selectedPago.totalDescuentos;
                this.subtotal = this.selectedPago.subtotal;
                return
              }

              if(fechapago > this.date){
                this.toastService.error('Ya se ha registrado un pago por ' + fechapago.toDate().toLocaleString('es', { month: 'long' }) + ' ' + fechapago.toDate().getUTCFullYear());
                this.selectedPago = {cargos: [], descuentos: []}
                return;
              };
              
              // En caso de que la fecha sea mayor a la fecha del ultimo pago, revisamos si es el mes que corresponde
              var n_meses = 1;
              if (this.selectedContrato.tiempoarriendo == 'Trimestral') n_meses = 3;
              if (this.selectedContrato.tiempoarriendo == 'Semestral') n_meses = 6;
              if (this.selectedContrato.tiempoarriendo == 'Anual') n_meses = 12;

              if(-fechapago.diff(this.date, 'months', true) > n_meses){
                const pagoCorresponde = fechapago.add(n_meses, 'months');
                this.toastService.warning('Aun no se genera el pago de ' + pagoCorresponde.toDate().toLocaleString('es', { month: 'long' }) + ' ' + pagoCorresponde.toDate().getUTCFullYear());
                //return;
              }

              // Si llego hasta aqui, hay que preparar el pago
              if(data[0]?.contratos[0]?.boletas.length > 0){
                this.cargos.push({tipo: 'Arriendo', concepto: '', detalle: '', valor: data[0]?.contratos[0]?.boletas[0]?.valorfinal});
              }else{
                this.cargos.push({tipo: 'Arriendo', concepto: '', detalle: '', valor: data[0]?.contratos[0]?.canonactual});
              }

              this.updateTotales();

            }
          });
    }
  }

  addDescuento(){
    this.descuentos.push({detalle: '', valor: 0});
  }

  addCargo(){
    this.cargos.push({tipo: 'Otro', concepto: '', detalle: '', valor: 0});
  }

  removeDescuento(){
    this.descuentos = this.descuentos.slice(0, this.descuentos.length - 1);
    this.updateTotales();
  }

  removeCargo(){
    this.cargos = this.cargos.slice(0, this.cargos.length - 1);
    this.updateTotales();
  }

  updateTotales(){
    var subtotalCargos = 0;
    this.cargos.forEach(cargo => subtotalCargos += +cargo.valor);

    var subtotalDescuentos = 0;
    this.descuentos.forEach(descuento => subtotalDescuentos += +descuento.valor);
    
    this.subtotal = +subtotalCargos - +subtotalDescuentos;
    this.totalCargos = +subtotalCargos;
    this.totalDescuentos = +subtotalDescuentos;
  }

  onGuardar(){
    this.accionesService.writePago({
      userid: this.selectedContrato.userid,
      propiedad: this.selectedPropiedadId,
      fechaemision: this.date.toDate(),
      fechapago: this.date.toDate(),
      contrato: this.selectedContratoId,
      cargos: this.cargos,
      descuentos: this.descuentos,
      totalCargos: this.totalCargos,
      totalDescuentos: this.totalDescuentos,
      subtotal: this.subtotal,
      formapago: this.formapago,
      documento: this.documento,
      banco: this.banco,
      depositadoen: this.depositadoen,
      bancoen: this.bancoen,
    }).subscribe(() => {
      this.changePropiedad(null);
      this.toastService.success('Operación realizada con éxito.');
    });
  }

  formatDate(date) {
    if(!date) return 'Presente';

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

  isNextArriendo(contrato, date){
    date = moment(date);
    if (contrato.tiempoarriendo == "Mensual") return true;
    if (contrato.tiempoarriendo == "Anual") return date.month() == moment(contrato.fechacontrato).month();
    if (contrato.tiempoarriendo == "Semestral") return date.month() == moment(contrato.fechacontrato).month() || 
                                                       date.month() == moment(contrato.fechacontrato).add(6, 'months').month()
    if (contrato.tiempoarriendo == "Semestral") return date.month() == moment(contrato.fechacontrato).month() || 
                                                       date.month() == moment(contrato.fechacontrato).add(6, 'months').month() ||
                                                       date.month() == moment(contrato.fechacontrato).add(3, 'months').month() ||
                                                       date.month() == moment(contrato.fechacontrato).add(9, 'months').month()
  }
}
