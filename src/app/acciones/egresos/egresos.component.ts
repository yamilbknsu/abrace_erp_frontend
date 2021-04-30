import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Propiedad } from 'src/app/models/Propiedad';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';
import { AccionesService } from '../acciones.service';

@Component({
  selector: 'app-egresos',
  templateUrl: './egresos.component.html',
  styleUrls: ['./egresos.component.css']
})
export class EgresosComponent implements OnInit {

  propiedades$;

  selectedPropiedadId: string = '';
  selectedPropiedadId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  selectedPropiedad: Propiedad;

  selectedEgreso;

  formaspago: any[] = [{name: 'Transferencia'}, {name: 'Cheque'}, {name: 'Efectivo'}, {name: 'Depósito'}];
  bancos$;

  egresos = [];

  showPdf = false;
  outputFileName: string = 'document.pdf';

  @ViewChild('pdfViewer') public pdfViewer;

  constructor(private propiedadesService: PropiedadesService, private accionesService: AccionesService,
    private pdfWriterService: PdfWriterService, private _cdr: ChangeDetectorRef, private parametrosService:ParametrosService) { }

  ngOnInit(): void {
    this.propiedadesService.loadPropiedadesFromBackend();
    this.propiedades$ = this.propiedadesService.getPropiedades$();

    this.selectedPropiedadId$.subscribe(id => {
      this.selectedPropiedad = this.propiedades$.value.filter(prop => prop._id == id)?.[0]
      if(id != ''){
        this.accionesService.loadEgresos(id).subscribe(egresos => {
          this.egresos = egresos.map(egreso => { egreso.fecha = moment(egreso.fecha).locale('es'); egreso.periodo = moment(egreso.periodo).locale('es'); return egreso;})
          
          this.selectedEgreso = {
            nroegreso: egresos.length + 1,
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
    this.selectedEgreso.conceptos.push({concepto: '', valor: 0})
  }

  eliminarConcepto(){
    this.selectedEgreso.conceptos = this.selectedEgreso.conceptos.slice(0, this.selectedEgreso.conceptos.length - 1)
  }

  nuevoIngreso(){
    this.selectedEgreso = {
      nroegreso: this.egresos.length + 1,
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

  selectEgreso(i){
    this.selectedEgreso = this.egresos[i];
    this.showPdf = false;
  }

  sumEgresos(egreso){
    var sum = 0;
    for(let i = 0; i<egreso.conceptos.length; i++){
      sum += egreso.conceptos[i].valor
    }
    return sum;
  }

  generarEgreso(){
    this.accionesService.writeEgreso(this.selectedEgreso).subscribe(() => {
      this.accionesService.loadEgresos(this.selectedPropiedadId).subscribe(egresos => {
        this.egresos = egresos.map(egreso => { egreso.fecha = moment(egreso.fecha).locale('es'); egreso.periodo = moment(egreso.periodo).locale('es'); return egreso;})
        
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
