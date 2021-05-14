import { Component, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css']
})
export class IngresoComponent implements OnInit {

  propiedades$;

  selectedPropiedadId: string = '';
  selectedPropiedadId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  selectedPropiedad: Propiedad;

  selectedIngreso;
  fechasLiqPago:any = undefined;

  formaspago: any[] = [{name: 'Transferencia'}, {name: 'Cheque'}, {name: 'Efectivo'}, {name: 'Depósito'}];

  ingresos = [];

  showPdf = false;
  outputFileName: string = 'document.pdf';

  bancos$;

  @ViewChild('pdfViewer') public pdfViewer;

  datePickerConfig = {
    locale: 'es'
  }

  constructor(private propiedadesService: PropiedadesService, private accionesService: AccionesService,
    private pdfWriterService: PdfWriterService, private parametrosService: ParametrosService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.propiedadesService.loadPropiedadesFromBackend();
    this.propiedades$ = this.propiedadesService.getPropiedades$();

    this.selectedPropiedadId$.subscribe(id => {
      this.selectedPropiedad = this.propiedades$.value.filter(prop => prop._id == id)?.[0]
      if(id != ''){
        this.accionesService.loadIngresos(id).subscribe(ingresos => {
          this.ingresos = ingresos.map(ingreso => { ingreso.fecha = moment(ingreso.fecha).locale('es'); ingreso.periodo = moment(ingreso.periodo).locale('es'); return ingreso;})
          console.log(ingresos)
          this.selectedIngreso = {
            nroingreso: ingresos.length + 1,
            periodo: moment().locale('es').startOf('month'),
            fecha: moment(),
            afectaarriendo: false,
            afectaliquidacion: false,
            conceptos: [{concepto: '', valor: 0}],
            userid: this.selectedPropiedad.userid,
            propiedad: this.selectedPropiedadId
          };
        });
      }
    });

    this.parametrosService.loadBancosFromBackend();
    this.bancos$ = this.parametrosService.bancos$.pipe(
      map(bancos => bancos.map((banco) => { return { name: banco } }))
    );
  }

  changePropiedad(id){
    if(id) this.selectedPropiedadId$.next(id);
    else this.selectedPropiedadId$.next('');
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

  padNumber(number){
    if (number<=9999) { number = ("000"+number).slice(-4); }
    return number;
  }

  agregarConcepto(){
    this.selectedIngreso.conceptos.push({concepto: '', valor: 0})
  }

  eliminarConcepto(){
    this.selectedIngreso.conceptos = this.selectedIngreso.conceptos.slice(0, this.selectedIngreso.conceptos.length - 1)
  }

  nuevoIngreso(){
    this.selectedIngreso = {
      nroingreso: this.ingresos.length + 1,
      periodo: moment().locale('es').startOf('month'),
      fecha: moment(),
      afectaarriendo: false,
      afectaliquidacion: false,
      conceptos: [{concepto: '', valor: 0}],
      userid: this.selectedPropiedad.userid,
      propiedad: this.selectedPropiedadId
    };
    this.showPdf = false;
  }

  selectIngreso(i){
    this.selectedIngreso = {...this.ingresos[i]};
    if(this.showPdf) this.showPdf = false;
  }

  sumIngresos(ingreso){
    var sum = 0;
    for(let i = 0; i<ingreso.conceptos.length; i++){
      sum += ingreso.conceptos[i].valor
    }
    return sum;
  }

  generarIngreso(){
    this.accionesService.loadFechasLiqPagos({propiedad: this.selectedPropiedadId})
        .subscribe(data => {
          this.fechasLiqPago = data
        
          var found = false;
          
          if(!this.selectedIngreso.afectaarriendo && !this.selectedIngreso.afectaliquidacion){
            this.toastService.error('El ingreso no afecta liquidación ni arriendo.')
            return;
          }
          if(this.fechasLiqPago){
            var periodo = moment(this.selectedIngreso.periodo);
            if(this.selectedIngreso.afectaarriendo){

              this.fechasLiqPago.pagos.forEach(element => {
                if((new Date(element)).getMonth() == periodo.toDate().getMonth() && (new Date(element)).getFullYear() == periodo.toDate().getFullYear()){
                  this.toastService.error('Ya se generó un pago para este mes')
                  found = true;
                  return;
                }
              });
            }

            if(this.selectedIngreso.afectaliquidacion){
              this.fechasLiqPago.liquidaciones.forEach(element => {
                if((new Date(element)).getMonth() == periodo.toDate().getMonth() && (new Date(element)).getFullYear() == periodo.toDate().getFullYear()){
                  this.toastService.error('Ya se generó una liquidación para este mes')
                  found = true;
                  return;
                }
              })
            }
          }

          if(found) return;

          this.accionesService.writeIngreso(this.selectedIngreso).subscribe(() => {
            this.accionesService.loadIngresos(this.selectedPropiedadId).subscribe(ingresos => {
              this.ingresos = ingresos.map(ingreso => { ingreso.fecha = moment(ingreso.fecha).locale('es'); ingreso.periodo = moment(ingreso.periodo).locale('es'); return ingreso;})
              
              this.showPdf = true;
              this.outputFileName = `ComprobanteIngreso_${this.selectedPropiedad.uId}_${this.formatDate(this.selectedIngreso.fecha, '')}.pdf`;

              var blob = this.pdfWriterService.generateIngresoEgreso([this.selectedIngreso], this.selectedPropiedad, true, false)

              this.pdfViewer.pdfSrc = blob;
              this.pdfViewer.downloadFileName = this.outputFileName;
              this.pdfViewer.refresh()
            });
          });
        });
  }

  emitirCopia(){
    this.showPdf = true;
    this.outputFileName = `ComprobanteIngreso_${this.selectedPropiedad.uId}_${this.formatDate(this.selectedIngreso.fecha, '')}.pdf`;

    var blob = this.pdfWriterService.generateIngresoEgreso([this.selectedIngreso], this.selectedPropiedad, true, true)

    this.pdfViewer.pdfSrc = blob;
    this.pdfViewer.downloadFileName = this.outputFileName;
    this.pdfViewer.refresh()
  }

  anularIngreso(){
    if(!this.selectedIngreso._id) return;
    this.accionesService.loadFechasLiqPagos({propiedad: this.selectedPropiedadId})
    .subscribe(data => {
      this.fechasLiqPago = data
    
      var found = false;
      if(this.fechasLiqPago){
        var periodo = moment(this.selectedIngreso.periodo);
        if(this.selectedIngreso.afectaarriendo){
          this.fechasLiqPago.pagos.forEach(element => {
            if((new Date(element)).getMonth() == periodo.toDate().getMonth() && (new Date(element)).getFullYear() == periodo.toDate().getFullYear()){
              this.toastService.error('No se puede anular, ya se generó un pago para este mes')
              found = true;
              return;
            }
          });
        }
        if(this.selectedIngreso.afectaliquidacion){
          this.fechasLiqPago.liquidaciones.forEach(element => {
            if((new Date(element)).getMonth() == periodo.toDate().getMonth() && (new Date(element)).getFullYear() == periodo.toDate().getFullYear()){
              this.toastService.error('No se puede anular, ya se generó una liquidación para este mes')
              found = true;
              return;
            }
          })
        }
      }
      if(found) return;

      this.propiedadesService.deleteIngreso(this.selectedIngreso._id).subscribe(() => {
        this.accionesService.loadIngresos(this.selectedPropiedadId).subscribe(ingresos => {
          this.toastService.success('Operación realizada con exito')
          this.ingresos = ingresos.map(ingreso => { ingreso.fecha = moment(ingreso.fecha).locale('es'); ingreso.periodo = moment(ingreso.periodo).locale('es'); return ingreso;});
          this.nuevoIngreso()
        });
      });
    });
  }

}
