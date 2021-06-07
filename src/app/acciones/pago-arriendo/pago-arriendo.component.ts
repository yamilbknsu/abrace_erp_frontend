import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Propiedad } from 'src/app/models/Propiedad';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';
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

  tiposCargo: any[] = [{name: 'Pago recurrente'}, {name: 'Mes garantía'}, {name: 'Otro'}];

  cargos: any[] = [];
  descuentos: any[] = [];

  formaspago: any[] = [{name: 'Transferencia'}, {name: 'Cheque'}, {name: 'Efectivo'}, {name: 'Depósito'}];
  bancos$;
  formapago: string = '';
  documento: string = '';
  banco: string = '';
  depositadoen: string = '';
  bancoen: string = '';

  saldoanterior = 0;
  pagado = 0;

  observaciones = '';
  nropago = 0;

  correspondeArriendo = true;
  cargandoPagos = false;

  showPdf = false;
  outputFileName: string = 'document.pdf';
  @ViewChild('pdfViewer') public pdfViewer;

  constructor(private route: ActivatedRoute, private accionesService: AccionesService,
    private toastService: ToastService, private parametrosService: ParametrosService, private propiedadesService: PropiedadesService,
    private pdfWriterService:PdfWriterService) { }

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

    this.correspondeArriendo = true;
    this.showPdf = false;
  }

  changeContrato(id){
    this.date = moment().startOf('month').locale('es');
    if(id) this.selectedContratoId$.next(id);
    else this.selectedContratoId$.next('');
    
    this.correspondeArriendo = this.isNextArriendo(this.selectedContrato, this.date);
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

    if(this.cargos[i].tipo == 'Mes garantía') this.cargos[i].valor = this.cargos.filter(cargo => cargo.tipo == 'Arriendo')[0].valor;
    this.updateTotales();
  }

  changePeriodo(){
    if(!this.date) this.date = moment().locale('es').startOf('month')
    this.showPdf = false;
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

      this.saldoanterior = 0;
      this.pagado = 0;

      this.observaciones = '';
      this.nropago = 0;
      this.datePago = moment();

      this.selectedPago = undefined;

      this.cargandoPagos = true;
      this.accionesService.loadPropiedadesPago({propiedad: this.selectedPropiedadId, contrato: this.selectedContratoId,
        periodo: this.date.toDate()})
          .subscribe((data) => {
            this.cargandoPagos = false;
            //console.log('A', data)
            
            if(data[0]?.contratos[0]?.pagos?.length == 0){
              // Primer pago
              const contfecha = new Date(data[0]?.contratos[0]?.fechacontrato)
              if(contfecha.getMonth() != this.date.toDate().getMonth() || contfecha.getFullYear() != this.date.toDate().getFullYear()){
                this.toastService.error('Debe ingresar el primer mes del contrato! (' + contfecha.toLocaleString('es', { month: 'long' }) + ' ' + contfecha.getUTCFullYear() + ')')
                this.date = moment(contfecha);
                return
              }
              
              this.cargos.push({tipo: 'Arriendo', concepto: '', detalle: 'Primer mes de arriendo', valor: data[0]?.contratos[0]?.canoninicial});

              if(+data[0]?.contratos[0].mesgarantia){
                this.cargos.push({tipo: 'Mes garantía', concepto: '', detalle: '', valor: +data[0]?.contratos[0].mesgarantia * +data[0]?.contratos[0]?.canoninicial});
              }

              this.updateTotales();
              this.loadIngresosEgresos();
              this.nropago = 1;
              return
            }

            // Si se recibieron pagos, entonces puede ser el del ultimo mes, o el de este mes
            if(data[0]?.contratos[0]?.pagos?.length == 1){
              const fechapago = moment(data[0]?.contratos[0]?.pagos[0].fechaemision);
              if(fechapago.month() == this.date.month() && fechapago.year() == this.date.year()){
                //this.toastService.error('Ya hay un pago registrado para este mes')
                this.selectedPago = data[0]?.contratos[0]?.pagos[0];
                this.cargos = this.selectedPago.cargos;
                this.descuentos = this.selectedPago.descuentos;


                this.datePago = moment(this.selectedPago.fechapago);
                this.formapago = this.selectedPago.formapago;
                this.documento = this.selectedPago.documento;
                this.banco = this.selectedPago.banco;
                this.depositadoen = this.selectedPago.depositadoen;
                this.bancoen = this.selectedPago.bancoen;
                this.totalCargos = this.selectedPago.totalCargos;
                this.totalDescuentos = this.selectedPago.totalDescuentos;
                this.subtotal = this.selectedPago.subtotal;
                this.observaciones = this.selectedPago.observaciones? this.selectedPago.observaciones : '';
                this.nropago = this.selectedPago.nropago ? this.selectedPago.nropago : 1;

                if(!this.selectedPago.saldoanterior) this.saldoanterior = 0
                else this.saldoanterior = this.selectedPago.saldoanterior

                if(!this.selectedPago.pagado) this.pagado = this.selectedPago.subtotal
                else this.pagado = this.selectedPago.pagado

                //this.loadIngresosEgresos();
                return
              }

              if(fechapago > this.date){
                this.toastService.error('Ya se ha registrado un pago por ' + fechapago.toDate().toLocaleString('es', { month: 'long' }) + ' ' + fechapago.toDate().getUTCFullYear());
                this.selectedPago = {cargos: [], descuentos: []}
                this.loadIngresosEgresos();

                this.observaciones = this.selectedPago.observaciones? this.selectedPago.observaciones : '';
                this.nropago = this.selectedPago.nropago ? this.selectedPago.nropago + 1 : 1;
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
              this.loadReajustes(data);
              this.loadIngresosEgresos();
              this.loadSaldoAnterior();

              const selectedPago = data[0]?.contratos[0]?.pagos[0];
              this.observaciones = '';
              this.nropago = selectedPago.nropago ? selectedPago.nropago + 1 : 1;
            }
          });
    }
  }

  loadIngresosEgresos(){
    this.propiedadesService.loadIngresosEgresosPropiedad(this.selectedPropiedadId, this.date.toDate())
        .subscribe(data => {
          data.ingresos.filter(ingreso => ingreso.afectaarriendo).forEach(ingreso => {
            this.descuentos.push({detalle: 'Detalle Ingreso ' + this.padNumber(ingreso.nroingreso), valor: this.sumIngresosEgresos(ingreso.conceptos)})
          });
          data.egresos.filter(egreso => egreso.afectaarriendo).forEach(egreso => {
            this.cargos.push({tipo: 'Otro', detalle:'', concepto: 'Detalle Egreso ' + this.padNumber(egreso.nroegreso), valor: this.sumIngresosEgresos(egreso.conceptos)})
          });

          this.updateTotales();
        })
  }

  loadSaldoAnterior(){
    this.propiedadesService.loadSaldoAnteriorPago(this.selectedPropiedadId)
        .subscribe(
          data => {
            console.log(data)
            this.saldoanterior = data[0];}
        )
  }

  loadReajustes(data){
    if(data[0]?.reajustes?.length > 0){
      for(let i=0;i<this.cargos.length; i++){
        if(this.cargos[i].tipo == 'Arriendo'){
          this.cargos[i].valor = data[0].reajustes[0].valorinicial;
          this.cargos.push({tipo: 'Otro', concepto: `Reajuste (${Math.round(data[0].reajustes[0].reajuste * 100) / 100} %)`, detalle: '', valor: data[0].reajustes[0].valorfinal - data[0].reajustes[0].valorinicial})
          break;
        }
      }
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
    if(this.selectedPago) return
    var subtotalCargos = 0;
    this.cargos.forEach(cargo => subtotalCargos += +cargo.valor);
    this.selectedPago?.cargos?.forEach(cargo => subtotalCargos += +cargo.valor);

    var subtotalDescuentos = 0;
    this.descuentos.forEach(descuento => subtotalDescuentos += +descuento.valor);
    this.selectedPago?.descuentos?.forEach(descuento => subtotalDescuentos += +descuento.valor);
    
    this.subtotal = +subtotalCargos - +subtotalDescuentos;
    this.totalCargos = +subtotalCargos;
    this.totalDescuentos = +subtotalDescuentos;
  }

  onGuardar(){
    this.selectedPago = {
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
      observaciones: this.observaciones,
      nropago: this.nropago,
      saldoanterior: this.saldoanterior,
      pagado: this.pagado
    };
    this.accionesService.writePago(this.selectedPago).subscribe(() => {
      this.emitirInforme(false);
      this.toastService.success('Operación realizada con éxito.');
      //this.changePeriodo();
    });
  }

  emitirInforme(copia=false){
    this.accionesService.loadPagosInforme({propiedad: this.selectedPropiedadId}).pipe(
      map(propiedades => this.propiedadesService.joinPropiedadData(propiedades)))
      .subscribe(
        propiedades => {
          this.propiedadesService.loadIngresosEgresosPropiedad(this.selectedPropiedadId, new Date(this.selectedPago.fechaemision))
              .subscribe(data => {
                console.log(data)
                this.showPdf = true;
                this.outputFileName = (copia ? 'Copia' : '') + 'ReciboArriendo' + `_${this.selectedPropiedad.uId}_${this.formatDate(this.selectedPago.fechaemision, '')}.pdf`;
                
                console.log(propiedades)
                var blob = this.pdfWriterService.generateBlobPdfFromPago(this.date, propiedades[0], this.selectedContrato, this.selectedPago,
                  {egresos: data.egresos?.filter(egreso => egreso.afectaarriendo),
                    ingresos: data.ingresos?.filter(ingreso => ingreso.afectaarriendo)}, copia);
            
                this.pdfViewer.pdfSrc = blob;
                this.pdfViewer.downloadFileName = this.outputFileName;
                this.pdfViewer.refresh();
              });
        }
      )
  }

  formatDate(date, sep='/') {
    if(!date) return 'Presente';

    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [day, month, year].join(sep);
  }

  isNextArriendo(contrato, date){
    date = moment(date);
    if (contrato.tiempoarriendo == "Mensual") return true;
    if (contrato.tiempoarriendo == "Anual") return date.month() == moment(contrato.fechacontrato).month();
    if (contrato.tiempoarriendo == "Semestral") return date.month() == moment(contrato.fechacontrato).month() || 
                                                       date.month() == moment(contrato.fechacontrato).add(6, 'months').month()
    if (contrato.tiempoarriendo == "Trimestral") return date.month() == moment(contrato.fechacontrato).month() || 
                                                       date.month() == moment(contrato.fechacontrato).add(6, 'months').month() ||
                                                       date.month() == moment(contrato.fechacontrato).add(3, 'months').month() ||
                                                       date.month() == moment(contrato.fechacontrato).add(9, 'months').month()
  }

  sumIngresosEgresos(array){
    var sum = 0;
    array.forEach(element => {
      sum += element.valor
    });
    return sum;
  }

  padNumber(number){
    if (number<=9999) { number = ("000"+number).slice(-4); }
    return number;
  }

  numberWithPoints(x) {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
