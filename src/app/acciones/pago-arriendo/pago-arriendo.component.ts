import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Propiedad } from 'src/app/models/Propiedad';
import { ParametrosService } from 'src/app/parametros/parametros.service';
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

  datePickerConfig = {
    locale: 'es'
  }

  tiposCargo: any[] = [{name: 'Arriendo'}, {name: 'Instruccion pago'}, {name: 'Otro'}];

  cargos: any[] = [];
  descuentos: any[] = [];

  formaspago: any[] = [{name: 'Transferencia'}, {name: 'Cheque'}, {name: 'Efectivo'}, {name: 'Depósito'}];
  bancos$;
  formapago: string = '';
  documento: string = '';
  banco: string = '';
  depositadoen: string = '';
  bancoen: string = '';

  constructor(private route: ActivatedRoute, private accionesService: AccionesService,
    private toastService: ToastService, private parametrosService: ParametrosService) { }

  ngOnInit(): void {
    this.date = moment();
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
        this.boletas = this.selectedContrato.boletas.map(boleta => {
          boleta.formatedFecha = this.formatDate(boleta.fecha);
          return boleta
        });
        this.instrucciones = this.selectedContrato.instrucciones;
        this.totalCargos = 0;
        this.totalDescuentos = 0;
        this.subtotal = 0;
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

  addDescuento(){
    this.descuentos.push({detalle: '', valor: 0});
  }

  addCargo(){
    this.cargos.push({tipo: 'Arriendo', concepto: '', detalle: '', valor: 0});
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
      fechapago: this.datePago.toDate(),
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
}
