import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-inf-propiedades',
  templateUrl: './inf-propiedades.component.html',
  styleUrls: ['./inf-propiedades.component.css']
})
export class InfPropiedadesComponent implements OnInit, OnDestroy {

  date: Date;
  propiedades$;

  tableData:any = [];
  tableheaders:any = [];
  propSubscription;

  sortingProperty = 'uId';
  ascending = true;

  outputFileName: string = 'document.pdf';
  showPdf = false;

  @ViewChild('pdfViewer') public pdfViewer;

  constructor(private propiedadesService: PropiedadesService, private toastService: ToastService,
              private pdfWriterService: PdfWriterService) { }

  ngOnDestroy(): void {
    this.propSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.date = new Date();
    this.propiedades$ = this.propiedadesService.propiedades$;
    if(this.propiedades$.value.length == 0){
      this.propiedadesService.loadPropiedadesFromBackend();
    }

    this.propSubscription = this.propiedades$.subscribe(props => {
      this.tableData = this.propiedades$.value.map(prop => ({uId: prop.uId, direccionStr: prop.direccionStr, comuna:prop.direccionData.comuna , mandante: prop.mandanteData.nombre, estado: prop.estados[0], arrendatario: prop.arrendatario}))
      this.tableheaders = [{key: 'uId', content: 'CÓDIGO'},
                           {key: 'direccionStr', content: 'DIRECCIÓN'},
                           {key: 'comuna', content: 'COMUNA'},
                           {key: 'mandante', content: 'MANDANTE'},
                           {key: 'estado', content: 'ESTADO'},
                           {key: 'arrendatario', content: 'ARRENDATARIO'}]
    })
  }

  sortData(key){
    if(key == this.sortingProperty) this.ascending = !this.ascending;
    this.sortingProperty = key

    if (this.ascending){
      this.tableData = this.tableData.sort((a,b) => a[key] < b[key] ? 1 : -1)
    }else{
      this.tableData = this.tableData.sort((a,b) => a[key] < b[key] ? -1 : 1)
    }
  }

  onGenerar(){
    this.showPdf = true;

    this.outputFileName = `InformePropiedades${this.formatDate(this.date, '')}.pdf`;
    // this.propiedades$.value.map(prop => ({uId: prop.uId, direccionStr: prop.direccionStr, mandante: prop.mandanteData.nombre, estado: prop.estados[0], arrendatario: prop.arrendatario}))
    //var repeated = [].concat(... new Array(5).fill());
    var blob = this.pdfWriterService.generateBlobPdfFromData(
                    [{uId: 'CÓDIGO', direccionStr: 'DIRECCIÓN', comuna: 'COMUNA', mandante: 'MANDANTE', estado: 'ESTADO', arrendatario: 'ARRENDATARIO'}],
                    this.tableData,
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
