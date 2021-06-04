import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { AccionesService } from 'src/app/acciones/acciones.service';
import { Propiedad } from 'src/app/models/Propiedad';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';

@Component({
  selector: 'app-inf-estado-liquidaciones',
  templateUrl: './inf-estado-liquidaciones.component.html',
  styleUrls: ['./inf-estado-liquidaciones.component.css']
})
export class InfEstadoLiquidacionesComponent implements OnInit {

  dateStart;
  dateEnd;
  propiedades:BehaviorSubject<Propiedad[]> = new BehaviorSubject<Propiedad[]>([]);
  selectedPropiedadId = '';
  outputFileName: string = 'document.pdf';

  datePickerConfig = {
    locale: 'es'
  }

  @ViewChild('pdfViewer') public pdfViewer;

  constructor(private pdfWriterService: PdfWriterService, private accionesService: AccionesService, private propiedadesService: PropiedadesService) { }

  ngOnInit(): void {
    this.dateStart = moment().locale('es').add(-12, 'M');
    this.dateEnd = moment().locale('es');
    this.propiedades = this.propiedadesService.propiedades$;
    this.propiedadesService.loadPropiedadesFromBackend();
  }

  onGenerar(){
    if(this.selectedPropiedadId == '') return;

    const selectedPropiedad:any = this.propiedades.value.filter(p => p._id == this.selectedPropiedadId)[0];

    const headers = [{periodo: 'PERIODO', concepto: 'CONCEPTO', abonos: {content: 'ABONOS',  styles: {halign: 'right'}} , cargos: {content: 'CARGOS',  styles: {halign: 'right'}},
    saldoliq: {content: 'SALDO LIQ.',  styles: {halign: 'right'}}, fechapago: {content: 'FECHA PAGO',  styles: {halign: 'right'}}}];
    const columnStyles = { concepto: { cellWidth: 'auto' }, abonos: {halign: 'right'}, cargos: {halign: 'right'}, saldoliq:{halign: 'right', fontStyle: "bold"}, fechapago: {halign: 'right'}};

    this.accionesService.loadLiquidacionesInforme({propiedad: this.selectedPropiedadId, fechastart: this.dateStart.startOf('month').toDate(),
                                                   fechaend: this.dateEnd.endOf('month').toDate()})
        .subscribe(data => {
          const data_inf = data[0]?.liquidaciones?.length > 0 ?  data[0]?.liquidaciones.map(liq => {
            return liq.abonos.map(abono => { abono.abono = true; return abono}).concat(liq.cargos)
                      .map((con, idx) => ({periodo: idx == 0 ? this.formatDate(liq.fecha) : '', concepto: con.concepto, abonos: con.abono ? this.numberWithPoints(con.valor) : '',
                      cargos: con.abono ? '' : this.numberWithPoints(con.valor), saldoliq:'', fechapago:''}))
                    .concat({periodo: '', concepto: 'Honorarios', abonos: '', cargos: this.numberWithPoints(liq.honorarios.valor), saldoliq: '', fechapago: ''})
                    .concat({periodo: '', concepto: 'Impuestos', abonos: '', cargos: this.numberWithPoints(liq.honorarios.impuestos), saldoliq: '', fechapago: ''})
                    .concat({periodo: '', concepto: 'TOTALES', abonos: this.numberWithPoints(liq.totalAbonos), cargos: this.numberWithPoints(liq.totalCargos),
                                saldoliq: this.numberWithPoints(liq.subtotal), fechapago: this.formatDate(liq.fechapago)})
                    .concat({periodo: '', concepto: '', abonos:'', cargos:'', saldoliq: '', fechapago: ''})
          }).flat() : [];

          this.outputFileName = `ResumenLiquidaciones_${selectedPropiedad.uId}_${this.formatDate(this.dateStart, '')}_${this.formatDate(this.dateEnd, '')}.pdf`;
          var blob = this.pdfWriterService.generateBlobPdfFromData(
                        headers,
                        data_inf,
                        'RESUMEN DE LIQUIDACIONES',
                        this.formatDate(moment().locale('es')),
                        { overflow: 'ellipsize', cellWidth: 'wrap', cellPadding: 2},
                        columnStyles,
                        {},
                        {top: 160}, 
                        `Propiedad: ${selectedPropiedad.uId} - ${selectedPropiedad.direccionStr}`);

          this.pdfViewer.pdfSrc = blob;
          this.pdfViewer.downloadFileName = this.outputFileName;
          this.pdfViewer.refresh()

        });
  }

  formatDate(date, separator='/') {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [day, month, year].join(separator);
  }

  numberWithPoints(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

}
