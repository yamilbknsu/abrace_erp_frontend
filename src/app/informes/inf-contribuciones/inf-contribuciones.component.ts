import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';
import { QueryService } from 'src/app/services/query.service';

@Component({
  selector: 'app-inf-contribuciones',
  templateUrl: './inf-contribuciones.component.html',
  styleUrls: ['./inf-contribuciones.component.css']
})
export class InfContribucionesComponent implements OnInit, OnDestroy {

  propiedades$;

  tableData:any = [];
  tableheaders:any = [];
  propSubscription;

  sortingProperty = 'uId';
  ascending = true;

  outputFileName: string = 'document.pdf';
  showPdf = false;

  @ViewChild('pdfViewer') public pdfViewer;

  constructor(private queryService: QueryService, private propiedadesService: PropiedadesService, private pdfWriterService: PdfWriterService) { }

  ngOnInit(): void {
    this.propiedades$ = this.queryService.executeGetQuery('read', 'infcontribuciones', {}, {}).pipe(
      map(data => this.propiedadesService.joinPropiedadData(data))
    )

    this.propSubscription = this.propiedades$.subscribe(props => {
      this.tableData = [];
      props.forEach(prop => {
        var first = true;
        if(prop.mandato.contribuciones){
          this.tableData.push({uId: prop.uId,
                               direccionStr: prop.direccionStr,
                               comuna: prop.direccionData.comuna,
                               mandante: prop.mandanteData.nombre,
                               concepto: 'Contribuciones',
                               descripcion: prop.mandato.contribucionesdesc ? prop.mandato.contribucionesdesc : ''})
          first = false;
        }

        if(prop.mandato.aseo){
          this.tableData.push({uId: prop.uId,
                               direccionStr: prop.direccionStr,
                               comuna: prop.direccionData.comuna,
                               mandante: prop.mandanteData.nombre,
                               concepto: 'Aseo',
                               descripcion: prop.mandato.aseodesc ? prop.mandato.aseodesc : ''})
          first = false;
        }

        if(prop.mandato.otro){
          this.tableData.push({uId: prop.uId,
                               direccionStr: prop.direccionStr,
                               comuna: prop.direccionData.comuna,
                               mandante: prop.mandanteData.nombre,
                               concepto: 'Otro',
                               descripcion: prop.mandato.otrodesc ? prop.mandato.otrodesc : ''})
          first = false;
        }
      });
      this.tableheaders = [{key: 'uId', content: 'CÓDIGO'},
                           {key: 'direccionStr', content: 'DIRECCIÓN'},
                           {key: 'comuna', content: 'COMUNA'},
                           {key: 'mandante', content: 'MANDANTE'},
                           {key: 'concepto', content: 'CONCEPTO'},
                           {key: 'descripcion', content: 'DESCRIPCIÓN'},]
      this.sortData('uId');
    })
  }

  ngOnDestroy(): void {
    this.propSubscription.unsubscribe();
  }

  sortData(key){
    if(key == this.sortingProperty) this.ascending = !this.ascending;
    this.sortingProperty = key

    if (this.ascending){
      this.tableData = this.tableData.sort((a,b) => a[key] < b[key] ? 1 : (a[key]  == b[key]) ? ((a['comuna'] < b['comuna'] ? 1 : -1)) : -1)
    }else{
      this.tableData = this.tableData.sort((a,b) => a[key] < b[key] ? -1 : (a[key]  == b[key]) ? ((a['comuna'] < b['comuna'] ? 1 : -1)) : 1)
    }
  }

  onGenerar(){
    this.showPdf = true;

    this.outputFileName = `InformePropiedades${this.formatDate(new Date(), '')}.pdf`;
    // this.propiedades$.value.map(prop => ({uId: prop.uId, direccionStr: prop.direccionStr, mandante: prop.mandanteData.nombre, estado: prop.estados[0], arrendatario: prop.arrendatario}))
    //var repeated = [].concat(... new Array(5).fill());
    var blob = this.pdfWriterService.generateBlobPdfFromData(
                    [{uId: 'CÓDIGO', direccionStr: 'DIRECCIÓN', comuna: 'COMUNA', mandante: 'MANDANTE', concepto: 'CONCEPTO', descripcion: 'DESCRIPCIÓN'}],
                    this.tableData,
                    'INFORME DE INSTRUCCIONES DE PAGO',
                    this.formatDate(new Date()),
                    { overflow: 'ellipsize', cellWidth: 'wrap' },
                    { direccionStr: { cellWidth: 'auto' }});
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
