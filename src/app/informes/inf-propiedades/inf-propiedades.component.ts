import { Component, OnInit, ViewChild } from '@angular/core';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-inf-propiedades',
  templateUrl: './inf-propiedades.component.html',
  styleUrls: ['./inf-propiedades.component.css']
})
export class InfPropiedadesComponent implements OnInit {

  date: Date;
  propiedades$;

  outputFileName: string = 'document.pdf';

  @ViewChild('pdfViewer') public pdfViewer;

  constructor(private propiedadesService: PropiedadesService, private toastService: ToastService,
              private pdfWriterService: PdfWriterService) { }

  ngOnInit(): void {
    this.date = new Date();
    this.propiedades$ = this.propiedadesService.propiedades$;
    if(this.propiedades$.value.length == 0){
      this.propiedadesService.loadPropiedadesFromBackend();
    }
  }

  onGenerar(){
    this.outputFileName = `InformePropiedades${this.formatDate(this.date, '')}.pdf`;
    // this.propiedades$.value.map(prop => ({uId: prop.uId, direccionStr: prop.direccionStr, mandante: prop.mandanteData.nombre, estado: prop.estados[0], arrendatario: prop.arrendatario}))
    //var repeated = [].concat(... new Array(5).fill());
    var blob = this.pdfWriterService.generateBlobPdfFromData(
                    [{uId: 'CÓDIGO', direccionStr: 'DIRECCIÓN', mandante: 'MANDANTE', estado: 'ESTADO', arrendatario: 'ARRENDATARIO'}],
                    this.propiedades$.value.map(prop => ({uId: prop.uId, direccionStr: prop.direccionStr, mandante: prop.mandanteData.nombre, estado: prop.estados[0], arrendatario: prop.arrendatario})),
                    'INFORME DE PROPIEDADES',
                    this.formatDate(this.date),
                    { overflow: 'ellipsize', cellWidth: 'wrap' },
                    { direccionStr: { cellWidth: 'auto' } });
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
}
