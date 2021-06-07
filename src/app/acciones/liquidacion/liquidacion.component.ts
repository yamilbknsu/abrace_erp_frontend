import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-liquidacion',
  templateUrl: './liquidacion.component.html',
  styleUrls: ['./liquidacion.component.css']
})
export class LiquidacionComponent implements OnInit {

  propiedades: any[] = [];
  date: any;
  datePago: any;

  instrucciones: any[] = [];

  selectedPropiedadId: string = '';
  selectedPropiedadId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  selectedPropiedad: any = new Propiedad();
  selectedLiquidacion: any = {};

  liquidacionExists = false;
  formaspago: any[] = [{name: 'Transferencia'}, {name: 'Cheque'}, {name: 'Efectivo'}, {name: 'Depósito'}];
  tiposimpuestos: any[] = [{name: 'Porcentual'}, {name: 'Absoluto'}];
  bancos$;

  cargandoLiquidacion = false;

  tiposCargo: any[] = [{name: 'Instrucción Pago'}, {name: 'Otro'}];

  ultimonro = 1;
  
  showPdf = false;
  outputFileName: string = 'document.pdf';
  @ViewChild('pdfViewer') public pdfViewer;

  datePickerConfig = {
    locale: 'es'
  }

  constructor(private route:ActivatedRoute, private parametrosService: ParametrosService,
              private accionesService: AccionesService, private toastService: ToastService,
              private propiedadesService: PropiedadesService, private _cdr: ChangeDetectorRef,
              private pdfWriterService: PdfWriterService) { }

  ngOnInit(): void {
    this.date = moment().locale('es');
    this.datePago = moment().locale('es')

    this.route.data.subscribe(data => {
      this.propiedades = data.propiedades;
    });

    this.selectedPropiedadId$.subscribe(id => {
      this.selectedPropiedad = this.propiedades.filter(prop => prop._id == id)?.[0];
      this.instrucciones = this.selectedPropiedad?.mandato?.instrucciones;
    });

    this.parametrosService.loadBancosFromBackend();
    this.bancos$ = this.parametrosService.bancos$.pipe(
      map(bancos => bancos.map((banco) => { return { name: banco } }))
    );
  }

  changePropiedad(id){
    if(id) this.selectedPropiedadId$.next(id);
    else this.selectedPropiedadId$.next('');
    this.date = moment().locale('es');
    this.changePeriodo();
  }

  changePeriodo(){
    if(this.cargandoLiquidacion) return;
    this.selectedLiquidacion = {};
    this.showPdf = false;

    this.cargandoLiquidacion = true;
    this.accionesService.loadLiquidaciones({fecha: this.date.toDate(), propiedad: this.selectedPropiedadId})
        .subscribe(data => {
          this.cargandoLiquidacion = false;

          if(data[0]?.length == 0){
            // Primera liquidacion
            const mandfecha = new Date(this.selectedPropiedad.mandato.fechaInicio)
            if(mandfecha.getMonth() != this.date.toDate().getMonth() || mandfecha.getFullYear() != this.date.toDate().getFullYear()){
              //this.toastService.error('Debe ingresar el primer mes del mandato! (' + mandfecha.toLocaleString('es', { month: 'long' }) + ' ' + mandfecha.getUTCFullYear() + ')')
              this.toastService.error('No se ha registrado ninguna liquidacion de este mandato! (Primer mes: ' + mandfecha.toLocaleString('es', { month: 'long' }) + ' ' + mandfecha.getUTCFullYear() + ')')
              //this.date = moment(mandfecha);
              return
            }
            
            //this.cargos.push({tipo: 'Arriendo', concepto: '', detalle: 'Primer mes de arriendo', valor: data[0]?.contratos[0]?.canoninicial});
            //this.cargos.push({tipo: 'Otro', concepto: 'Mes garantía', detalle: '', valor: data[0]?.contratos[0]?.canoninicial});

            this.updateTotales();
            this.selectedLiquidacion = {}
            this.ultimonro = 0;
            //this.loadIngresosEgresos();
            return
          }

          if((new Date(data[0][0].fecha)).getMonth() == this.date.toDate().getMonth() && (new Date(data[0][0].fecha)).getFullYear() == this.date.toDate().getFullYear()){
            this.liquidacionExists = true;
            this.selectedLiquidacion = data[0][0];
            this.selectedLiquidacion.fechapago = moment(this.selectedLiquidacion.fechapago);
            //this.loadIngresosEgresos();
          }else{
            this.liquidacionExists = false;
            this.selectedLiquidacion = {};
          }
          
          this.ultimonro = data[0][0].nroliquidacion ? data[0][0].nroliquidacion : 0;
        });
    return

    //var liquidaciones = this.selectedPropiedad.liquidaciones.filter(liq => new Date(liq.fecha).getMonth() == new Date(this.date).getMonth())
    //if(liquidaciones.length > 0){
    //  this.liquidacionExists = true;
    //  this.selectedLiquidacion = liquidaciones[0];
    //}
    //else{
    //  this.liquidacionExists = false;
    //  this.selectedLiquidacion = {};
    //}
  }

  addAbono(){
    this.selectedLiquidacion.abonos.push({concepto: '', valor: 0});

  }

  removeAbono(){
    this.selectedLiquidacion.abonos = this.selectedLiquidacion.abonos.slice(0, this.selectedLiquidacion.abonos.length - 1);
    this.updateTotales();
  }

  addCargo(){
    this.selectedLiquidacion.cargos.push({tipo:'Otro', concepto: '', detalle: 'A', valor: 0});
  }

  removeCargo(){
    this.selectedLiquidacion.cargos = this.selectedLiquidacion.cargos.slice(0, this.selectedLiquidacion.cargos.length - 1);
    this.updateTotales();    
  }

  changeTipo(i){
    this.selectedLiquidacion.cargos[i].concepto = '';
    this.selectedLiquidacion.cargos[i].detalle = '';
    this.selectedLiquidacion.cargos[i].valor = 0;

    this.updateTotales();
  }

  changeConcepto(i){
    this.selectedLiquidacion.cargos[i].detalle = this.instrucciones.filter(inst => inst.nombre == this.selectedLiquidacion.cargos[i].concepto)[0]?.detalle;
  }

  updateTotales(){
    var subtotalCargos = +this.selectedLiquidacion.honorarios?.valor + +this.selectedLiquidacion.honorarios?.impuestos;
    this.selectedLiquidacion?.cargos?.forEach(cargo => subtotalCargos += +cargo.valor);

    var subtotalAbonos = 0;
    this.selectedLiquidacion.abonos?.forEach(abono => subtotalAbonos += +abono.valor);
    
    this.selectedLiquidacion.subtotal = +subtotalAbonos - +subtotalCargos;
    this.selectedLiquidacion.totalCargos = +subtotalCargos;
    this.selectedLiquidacion.totalAbonos = +subtotalAbonos;
  }

  onGuardar(){
    if(!this.liquidacionExists){
      this.accionesService.writeLiquidacion([this.selectedLiquidacion].map(liq => {liq.fechapago = liq.fechapago.toDate(); return liq;})[0])
          .subscribe(() => {
            this.toastService.success('Operación realizada con éxito');
            //window.location.reload();
            this.emitirInforme(false);
          })
    }
  }

  preparar(){
    this.accionesService.loadPropiedadesPago({propiedad: this.selectedPropiedadId, periodo: this.date.toDate()})
        .subscribe(data => {
          if(data.length == 0) {
            this.toastService.error('No se ha registrado ningún pago para esta propiedad!')
            this.selectedLiquidacion = {}
            return;
          }

          if(data[0].contratos?.[0]?.pagos?.length == 0){
            this.toastService.error('No se ha registrado ningún pago para esta propiedad!')
            this.selectedLiquidacion = {}
            return
          };
          
          var lastPago = data[0].contratos?.[0]?.pagos[0];
          var abonos = [];
          var cargos = [];
          var totalAbonos = 0;
          var totalCargos = 0;
          var subtotal = 0;
          var arriendo = 0;
          var primeraLiquidacion = false;
          var incluyeAdm = this.selectedPropiedad.mandato.comisiones.incluirhononadmin == 'true' || this.selectedPropiedad.mandato.comisiones.incluirhononadmin
          var comisiones = this.selectedPropiedad.mandato.comisiones;

          if((new Date(lastPago.fechaemision)).getMonth() != this.date.toDate().getMonth() || (new Date(lastPago.fechaemision)).getFullYear() != this.date.toDate().getFullYear()){
            this.toastService.error('No se ha generado pago para este periodo!');
            if(data[0].contratos?.[0]?.boletas.length > 0){
              const lastBoleta = data[0].contratos?.[0]?.boletas[0];
              if((new Date(lastBoleta.fecha)).getMonth() == this.date.toDate().getMonth() || (new Date(lastBoleta.fecha)).getFullYear() == this.date.toDate().getFullYear()){
                abonos.push({concepto: 'Arriendo', valor: +lastBoleta.valorfinal})
                arriendo = +lastBoleta.valorfinal;
              }else{
                abonos.push({concepto: 'Arriendo', valor:data[0].contratos[0].canonactual})
                arriendo = data[0].contratos[0].canonactual;
              }
            }else{
              abonos.push({concepto: 'Arriendo', valor:data[0].contratos[0].canonactual})
              arriendo = data[0].contratos[0].canonactual;
            }
          }else{
            lastPago.cargos.forEach(cargo => {
              if(cargo.tipo != 'Arriendo' && cargo.tipo != 'Mes garantía'){
                abonos.push({concepto: cargo.concepto, valor: cargo.valor});
                if(!cargo.concepto.includes('Reajuste ('))
                  cargos.push({tipo: 'Otro', concepto: cargo.concepto, detalle: cargo.detalle, valor: cargo.valor})
                else
                arriendo += cargo.valor;
              }else{
                abonos.push({concepto: cargo.tipo, valor: cargo.valor});
                if(cargo.tipo == 'Arriendo'){
                  arriendo = cargo.valor;
                }else if(cargo.tipo == 'Mes garantía'){
                  primeraLiquidacion = true;
                }
              }
            });
          }


          if(primeraLiquidacion){
            var valor = comisiones.tipocontrato == "Porcentual" ?  +comisiones.valorcontrato * arriendo / 100 : +comisiones.valorcontrato;
            var incluyeContImpuesto = this.selectedPropiedad.mandato.comisiones.contratoimpuestoincluido == 'true' || this.selectedPropiedad.mandato.comisiones.contratoimpuestoincluido
            if(!incluyeContImpuesto){
              valor *= 1 + (+comisiones.impuestocontrato / 100)
              valor = Math.round(valor);
            }

            if(comisiones.tipocontrato == "Porcentual"){
              cargos.push({tipo: 'Otro', concepto: 'Comisión firma contrato ('+comisiones.valorcontrato + '% ' + (incluyeContImpuesto ? "inc. impuestos" : "+ "+ +comisiones.impuestocontrato +"%impuestos") + ')',
                           detalle: '', valor: valor})
            }else{
              cargos.push({tipo: 'Otro', concepto: 'Comisión firma contrato',
                           detalle: '', valor: valor})
            }
          }
          
          abonos.forEach(abono => totalAbonos += +abono.valor);
          cargos.forEach(cargo => totalCargos += +cargo.valor);

          subtotal = totalAbonos - totalCargos


          this.selectedPropiedad.mandato.otrosdestinatarios.forEach(element => {
            var valor = element.tipocalculo == 'Porcentual' ? +element.monto * +arriendo / 100 : +element.monto;
            cargos.push({concepto: "Pago a " + element.nombre + ", " + element.formapago + " cta. " + element.nrocuenta + 
                        " banco " + element.banco, valor: valor});
            totalCargos += valor;
          });

          var honorAdmin = !primeraLiquidacion || incluyeAdm ? (comisiones.tipoadm == "Porcentual" ?
                                                                        +comisiones.valoradm * arriendo / 100 :
                                                                        +comisiones.valoradm) : 0

          var honorarios = {tipo: comisiones.tipoadm,
                            valor: Math.round(honorAdmin),
                            descripcion: (!primeraLiquidacion || incluyeAdm) ? 
                                      ((comisiones.tipoadm == "Porcentual" ?
                                        +comisiones.valoradm + "%" : 
                                        "$" + +comisiones.valoradm) + 
                                        (comisiones.admimpuestoincluido ? " inc. impuestos" : " no inc. impuestos")) : 'Primer contrato no incluye adm.',
                            impuestos: comisiones.admimpuestoincluido ? 0 :
                                      Math.round(+comisiones.impuestoadm * honorAdmin / 100)
                          };
          
          totalCargos += honorarios.valor + honorarios.impuestos;
          subtotal = totalAbonos - totalCargos;

          this.selectedLiquidacion = {
            fecha: this.date.toDate(),
            fechapago: this.datePago,
            abonos,
            cargos,
            totalAbonos,
            totalCargos,
            subtotal,
            honorarios,
            formapago: this.selectedPropiedad.mandato.liquidacion.formapago,
            documento:this.selectedPropiedad.mandato.liquidacion.cuenta,
            banco: this.selectedPropiedad.mandato.liquidacion.banco,
            userid: this.selectedPropiedad.userid,
            propiedad: this.selectedPropiedadId,
            nroliquidacion: this.ultimonro + 1,
            observaciones: ''
          }
          
          this.loadIngresosEgresos();
        })
  }

  loadIngresosEgresos(){
    this.propiedadesService.loadIngresosEgresosPropiedad(this.selectedPropiedadId, this.date.toDate())
        .subscribe(data => {
          data.ingresos.filter(ingreso => ingreso.afectaliquidacion).forEach(ingreso => {
            this.selectedLiquidacion.cargos.push({tipo: 'Otro', detalle:'', concepto: 'Detalle Egreso ' + this.padNumber(ingreso.nroegreso), valor: this.sumIngresosEgresos(ingreso.conceptos)})
          });
          data.egresos.filter(egreso => egreso.afectaliquidacion).forEach(egreso => {
            this.selectedLiquidacion.abonos.push({concepto: 'Detalle Ingreso ' + this.padNumber(egreso.nroingreso), valor: this.sumIngresosEgresos(egreso.conceptos)})
          });

          this.updateTotales();
        })
  }

  emitirInforme(copia){
    this.accionesService.loadLiquidacionesInforme({propiedad: this.selectedPropiedad._id}).pipe(
      map(propiedades => this.propiedadesService.joinPropiedadData(propiedades)))
      .subscribe(
        propiedades => {
          this.propiedadesService.loadIngresosEgresosPropiedad(this.selectedPropiedadId, new Date(this.selectedLiquidacion.fecha))
              .subscribe(data => {
                this.showPdf = true;
                this.outputFileName = `ComprobanteLiquidacion_${this.selectedPropiedad.uId}_${this.formatDate(this.selectedLiquidacion.fecha, '')}.pdf`;
                
                var blob = this.pdfWriterService.generateBlobPdfFromLiquidacion(this.date, propiedades[0], this.selectedLiquidacion,
                  {egresos: data.egresos?.filter(egreso => egreso.afectaliquidacion),
                    ingresos: data.ingresos?.filter(ingreso => ingreso.afectaliquidacion)}, copia);
            
                this.pdfViewer.pdfSrc = blob;
                this.pdfViewer.downloadFileName = this.outputFileName;
                this.pdfViewer.refresh();
              });
        }
      )
  }

  padNumber(number){
    if (number<=9999) { number = ("000"+number).slice(-4); }
    return number;
  }

  sumIngresosEgresos(array){
    var sum = 0;
    array.forEach(element => {
      sum += element.valor
    });
    return sum;
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

  numberWithPoints(x) {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

}
