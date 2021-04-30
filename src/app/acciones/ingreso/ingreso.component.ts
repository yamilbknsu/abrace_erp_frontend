import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Propiedad } from 'src/app/models/Propiedad';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';
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
    private pdfWriterService: PdfWriterService, private parametrosService: ParametrosService) { }

  ngOnInit(): void {
    this.propiedadesService.loadPropiedadesFromBackend();
    this.propiedades$ = this.propiedadesService.getPropiedades$();

    this.selectedPropiedadId$.subscribe(id => {
      this.selectedPropiedad = this.propiedades$.value.filter(prop => prop._id == id)?.[0]
      if(id != ''){
        this.accionesService.loadIngresos(id).subscribe(ingresos => {
          this.ingresos = ingresos.map(ingreso => { ingreso.fecha = moment(ingreso.fecha).locale('es'); ingreso.periodo = moment(ingreso.periodo).locale('es'); return ingreso;})
          
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
    this.selectedIngreso = this.ingresos[i];
    this.showPdf = false;
  }

  sumIngresos(ingreso){
    var sum = 0;
    for(let i = 0; i<ingreso.conceptos.length; i++){
      sum += ingreso.conceptos[i].valor
    }
    return sum;
  }

  generarIngreso(){
    this.accionesService.writeIngreso(this.selectedIngreso).subscribe(() => {
      this.accionesService.loadIngresos(this.selectedPropiedadId).subscribe(ingresos => {
        this.ingresos = ingresos.map(ingreso => { ingreso.fecha = moment(ingreso.fecha).locale('es'); ingreso.periodo = moment(ingreso.periodo).locale('es'); return ingreso;})
        
        this.showPdf = true;
        this.outputFileName = `ejemplo.pdf`;

        var blob = this.pdfWriterService.generateIngresoEgresoNewWindow()

        this.pdfViewer.pdfSrc = blob;
        this.pdfViewer.downloadFileName = this.outputFileName;
        this.pdfViewer.refresh()
      });
    });

  }

}
