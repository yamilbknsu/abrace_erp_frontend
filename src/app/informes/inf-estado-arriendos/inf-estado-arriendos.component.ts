import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AccionesService } from 'src/app/acciones/acciones.service';
import { Propiedad } from 'src/app/models/Propiedad';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';

@Component({
  selector: 'app-inf-estado-arriendos',
  templateUrl: './inf-estado-arriendos.component.html',
  styleUrls: ['./inf-estado-arriendos.component.css']
})
export class InfEstadoArriendosComponent implements OnInit {

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

    const headers = [{periodo: 'PERIODO', concepto: 'CONCEPTO', cargos: {content: 'CARGOS',  styles: {halign: 'right'}} , descuentos: {content: 'DSCTOS.',  styles: {halign: 'right'}},
    saldoliq: {content: 'SALDO LIQ.',  styles: {halign: 'right'}}, fechapago: {content: 'FECHA PAGO',  styles: {halign: 'right'}}}];
    const columnStyles = { concepto: { cellWidth: 'auto' }, cargos: {halign: 'right'}, descuentos: {halign: 'right'}, saldoliq:{halign: 'right', fontStyle: "bold"}, fechapago: {halign: 'right'}};

    this.accionesService.loadPagosInforme({propiedad: this.selectedPropiedadId, fechastart: this.dateStart.startOf('month').toDate(),
                                                   fechaend: this.dateEnd.endOf('month').toDate()})
        .subscribe(data => {
          const data_inf = data[0]?.pagos?.length > 0 ?  data[0]?.pagos.map(pago => {
            if(pago.pagado == undefined) pago.pagado = pago.subtotal
            if(pago.saldoanterior == undefined) pago.saldoanterior = 0

            var out = pago.cargos.map(cargo => { cargo.cargo = true; return cargo}).concat(pago.descuentos)
                      .map((con, idx) => ({periodo: idx == 0 ? this.formatDate(moment(pago.fechaemision), '/', false) : '',
                                           concepto: (con.concepto && con.concepto != '') ? con.concepto : ((con.tipo == 'Arriendo' || con.tipo == 'Mes garantía') ? con.tipo : con.detalle),
                                           cargos: con.cargo ? this.numberWithPoints(con.valor) : '',
                                           descuentos: con.cargo ? '' : this.numberWithPoints(con.valor), saldoliq:'', fechapago:''}))
                    
                      .concat({periodo: '', concepto: 'TOTALES', cargos: this.numberWithPoints(pago.totalCargos), descuentos: this.numberWithPoints(pago.totalDescuentos),
                                saldoliq: this.numberWithPoints(pago.subtotal), fechapago: ''})
            if(pago.saldoanterior != 0)
              out = out.concat({periodo: '', concepto: 'SALDO ANTERIOR', cargos: '', descuentos: '',
              saldoliq: this.numberWithPoints(pago.saldoanterior), fechapago: ''})             
            
            return out.concat({periodo: '', concepto: 'VALOR PAGADO', cargos: '', descuentos: '',
                          saldoliq: this.numberWithPoints(pago.pagado), fechapago: this.formatDate(pago.fechapago)})
                      .concat({perioliodo: '', concepto: '', cargos:'', descuentos:'', saldoliq: '', fechapago: ''})
          }).flat() : [];

          this.outputFileName = `ResumenArriendos_${selectedPropiedad.uId}_${this.formatDate(this.dateStart, '')}_${this.formatDate(this.dateEnd, '')}.pdf`;
          var blob = this.pdfWriterService.generateBlobPdfFromData(
                        headers,
                        data_inf,
                        'RESUMEN DE ARRIENDOS',
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

  formatDate(date, separator='/', showDay=true) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    if (showDay)
      return [day, month, year].join(separator);
    return [month, year].join(separator);
  }

  numberWithPoints(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

}
