import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';
import { QueryService } from 'src/app/services/query.service';

@Component({
  selector: 'app-reajustes',
  templateUrl: './reajustes.component.html',
  styleUrls: ['./reajustes.component.css']
})
export class InfReajustesComponent implements OnInit {

  date;
  outputFileName: string = 'document.pdf';

  reajustes: any[];
  datePickerConfig = {
    locale: 'es'
  }

  @ViewChild('pdfViewer') public pdfViewer;
  
  constructor(private pdfWriterService: PdfWriterService, private queryService: QueryService,
    private router: Router, private propiedadService: PropiedadesService) { }

  ngOnInit(): void {
    this.date = moment().locale('es').startOf('month');
    
    this.queryService.executeGetQuery('read', 'infreajustes', {}, {})
                    .pipe(  
                      catchError(err => {
                        if (err.status == 403){
                          this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
                        };
                        return EMPTY;}))
        .subscribe(data => {
          this.reajustes = data.map(e =>{
            e.propiedad = this.propiedadService.writeDireccionStr(e.propiedad);
            return e;
          })
        });
  }

  onGenerar(){
    var data = this.reajustes.filter(e => moment(new Date(e.fecha)).startOf('month').diff(this.date, 'months') == 0);
    console.log(data);

    this.outputFileName = `ReajustePropiedades${this.formatDate(this.date, '')}.pdf`;

    var blob = this.pdfWriterService.generateBlobPdfFromData(
                  [{uId: 'CÓDIGO', direccionStr: 'DIRECCIÓN', tiporeaj: 'TIPO REAJ.', anterior: 'RENTA ANT.', porcentaje: '%', monto: 'MONTO',  nueva: 'RENTA NUEVA'}],
                  data.map(e => ({uId: e.propiedad.uId, direccionStr: e.propiedad.direccionStr, tiporeaj: e.tipo != "Extraordinario" ? e.contrato.tiemporeajuste.toUpperCase() : 'EXTRAORDINARIO', anterior: this.numberWithPoints(e.valorinicial),
                  porcentaje: this.numberWithPoints(Math.round(((e.valorfinal/e.valorinicial) - 1) * 10000)/100), monto: this.numberWithPoints(e.valorfinal - e.valorinicial), nueva:this.numberWithPoints(e.valorfinal)})),
                  'PROPIEDADES REAJUSTADAS  ' + (this.date.month() + 1).toString().padStart(2, '0') + '/' + this.date.year(),
                  this.formatDate(moment().locale('es')),
                  { overflow: 'ellipsize', cellWidth: 'wrap' },
                  { direccionStr: { cellWidth: 'auto' }, porcentaje: { cellWidth: 'wrap', overflow: 'linebreak'}, anterior: {halign: 'center'}, nueva: {halign: 'center'}, monto: {halign: 'center'}});
    this.pdfViewer.pdfSrc = blob;
    this.pdfViewer.downloadFileName = this.outputFileName;
    this.pdfViewer.refresh()
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
