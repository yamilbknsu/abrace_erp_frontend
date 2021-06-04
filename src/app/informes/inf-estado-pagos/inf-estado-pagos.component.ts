import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { AccionesService } from 'src/app/acciones/acciones.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';

@Component({
  selector: 'app-inf-estado-pagos',
  templateUrl: './inf-estado-pagos.component.html',
  styleUrls: ['./inf-estado-pagos.component.css']
})
export class InfEstadoPagosComponent implements OnInit {
  
  date;
  outputFileName: string = 'document.pdf';

  showPdf = false;
  tableheaders = [];
  tableData = [];

  sortingProperty = 'codigo';
  ascending = true;

  datePickerConfig = {
    locale: 'es'
  }

  @ViewChild('pdfViewer') public pdfViewer;

  constructor(private accionesService: AccionesService, private propiedadesService: PropiedadesService,
              private pdfWriterService: PdfWriterService) { }

  ngOnInit(): void {
    this.date = moment().locale('es').startOf('month');
    this.tableheaders = [{key: 'codigo', content: 'COD.'},
                         {key: 'direccion', content: 'DIRECCIÓN'},
                         {key: 'canon', content: 'CANON'},
                         {key: 'arrdsct', content: 'DSCTOS'},
                         {key: 'arrcargos', content: 'CARGOS'},
                         {key: 'pagado', content: 'PAGADO'},
                         {key: 'abonos', content: 'ABONOS'},
                         {key: 'liqcargos', content: 'CARGOS'},
                         {key: 'honorarios', content: 'HONOR.'},
                         {key: 'liq', content: 'LIQ.'}];
  }

  changeFecha(){
    if(!this.date) this.date = moment().locale('es').startOf('month')
    this.tableData = [];
    this.showPdf = false;
    this.pdfViewer.pdfSrc = undefined;
    this.pdfViewer.refresh()
  }

  onPreparar(){

    this.accionesService.loadEstadoPagos({periodo: this.date.toDate()})
        .subscribe(data => {
          this.tableData = this.propiedadesService.joinPropiedadData(data).map(prop => {
            console.log(prop, prop.contratos[0]?.boletas)
            var canon = this.filterBoletas(prop.contratos[0]?.boletas)?.length > 0 ? this.filterBoletas(prop.contratos[0]?.boletas)[0].valorfinal : (prop.contratos[0]?.canonactual ? prop.contratos[0]?.canonactual : '-');
            var pago = prop.contratos[0]?.pagos?.length > 0 ? prop.contratos[0]?.pagos[0] : {};
            var liq = prop.liquidaciones?.length > 0 ? prop.liquidaciones[0] : {}
            var honorarios = liq.honorarios ? liq.honorarios.valor + liq.honorarios.impuestos : 0;
            return {codigo: prop.uId, direccion: prop.direccionStr, canon: this.numberWithPoints(canon),
                    arrcargos: pago.totalCargos ? this.numberWithPoints(this.eliminarCanonArriendo(pago, pago.totalCargos)) : '',
                    arrdsct: pago.totalDescuentos ? this.numberWithPoints(pago.totalDescuentos) : '',
                    pagado: pago.subtotal ? this.numberWithPoints(pago.subtotal) : '',
                    abonos: liq.totalAbonos ? this.numberWithPoints(this.eliminarCanonLiq(liq, liq.totalAbonos)):'',
                    liqcargos: liq.totalCargos ? this.numberWithPoints(liq.totalCargos - honorarios): '',
                    honorarios: this.numberWithPoints(honorarios),
                    liq: this.numberWithPoints(liq.subtotal ? liq.subtotal : '')
                   }
          });
          this.tableData = this.tableData.sort((a,b) => a.codigo < b.codigo ? -1 : 1)
        })

  }

  onGenerar(){
    this.showPdf = true;
    const headers = [{codigo: 'COD.', direccion: 'DIRECCIÓN', canon: {content: 'CANON',  styles: {halign: 'right'}},
                      arrdsct: {content: 'DSCTOS',  styles: {halign: 'right'}},
                      arrcargos: {content: 'CARGOS',  styles: {halign: 'right'}},
                      pagado: {content: 'PAGADO',  styles: {halign: 'right'}},
                      abonos: {content: 'ABONOS',  styles: {halign: 'right'}},
                      liqcargos: {content: 'CARGOS',  styles: {halign: 'right'}},
                      honorarios: {content: 'HONOR.',  styles: {halign: 'right'}},
                      liq: {content: 'LIQ.',  styles: {halign: 'right'}}
                    }];
    const columnStyles = { direccion: { cellWidth: 'auto' },
                            canon: {halign: 'right', fontStyle: "bold"},
                            arrcargos: {halign: 'right'},
                            arrdsct: {halign: 'right'},
                            pagado:{halign: 'right', fontStyle: "bold"},
                            abonos: {halign: 'right'},
                            liqcargos: {halign: 'right'},
                            honorarios: {halign: 'right'},
                            liq: {halign: 'right', fontStyle: "bold"}};
    this.tableData = this.tableData
                          .concat({
                            codigo: '',
                            direccion: 'TOTALES',
                            canon: this.numberWithPoints(this.tableData.reduce((t, i) =>  ((i.canon != '-' ? +i.canon.replaceAll('.', '') : 0) + +t), 0)),
                            arrcargos: this.numberWithPoints(this.tableData.reduce((t, i) => (+i.arrcargos.replaceAll('.', '') + +t), 0)),
                            arrdsct: this.numberWithPoints(this.tableData.reduce((t, i) => (+i.arrdsct.replace('.', '') + +t), 0)),
                            pagado: this.numberWithPoints(this.tableData.reduce((t, i) => (+i.pagado.replace('.', '') + +t), 0)),
                            abonos: this.numberWithPoints(this.tableData.reduce((t, i) => (+i.abonos.replace('.', '') + +t), 0)),
                            liqcargos: this.numberWithPoints(this.tableData.reduce((t, i) => (+i.liqcargos.replace('.', '') + +t), 0)),
                            honorarios: this.numberWithPoints(this.tableData.reduce((t, i) => (+i.honorarios.replace('.', '') + +t), 0)),
                            liq: this.numberWithPoints(this.tableData.reduce((t, i) => (+i.liq.replace('.', '') + +t), 0))
                          })
      
    this.outputFileName = `EstadoPagos_${this.formatDate(this.date, '')}.pdf`;
    var blob = this.pdfWriterService.generateBlobPdfFromData(
                  headers,
                  this.tableData,
                  `ESTADO DE PAGOS   ${this.date.month() + 1}/${this.date.year()}`,
                  this.formatDate(moment().locale('es')),
                  { overflow: 'ellipsize', cellWidth: 'wrap', cellPadding: 5},
                  columnStyles,
                  {},
                  {top: 150},
                  undefined,
                  (data)=> {
                    if(data.row.section == 'head'){
                      if(data.cell.text[0] == 'DSCTOS' || data.cell.text[0] == 'CARGOS' || data.cell.text[0] == 'PAGADO' ||
                      data.cell.text[0] == 'ABONOS' || data.cell.text[0] == 'HONOR.' || data.cell.text[0] == 'LIQ.'){
                        data.doc.setDrawColor('black')
                        data.doc.setLineWidth(1);
                        data.doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                      }

                      if(data.cell.text[0] == 'DSCTOS' || data.cell.text[0] == 'ABONOS'){
                        data.doc.setDrawColor('black')
                        data.doc.setLineWidth(1);
                        data.doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                      }
                      if(data.cell.text[0] == 'LIQ.' ){
                        data.doc.setDrawColor('black')
                        data.doc.setLineWidth(1);
                        data.doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x+ data.cell.width, data.cell.y + data.cell.height);
                      }

                      if(data.column.dataKey === 'arrcargos'){
                        data.doc.text('ARRIENDO', data.cell.x + data.cell.width/2, data.cell.y - 5, {align: 'center'})
                      }

                      if(data.column.dataKey === 'honorarios'){
                        data.doc.text('LIQUIDACIÓN', data.cell.x, data.cell.y - 5, {align: 'center'})
                      }
                    }else{
                      if(data.column.dataKey != 'codigo' && data.column.dataKey != 'direccion' && data.column.dataKey != 'canon'){
                        data.doc.setDrawColor('gray')
                        data.doc.setLineWidth(1);
                        data.doc.setLineDash([2, 2], 0);
                        data.doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                      }
                    }
                  });

    this.pdfViewer.pdfSrc = blob;
    this.pdfViewer.downloadFileName = this.outputFileName;
    this.pdfViewer.refresh()
  }

  filterBoletas(boletas): any{
    if(boletas?.length == 0) return []
    return boletas?.filter(b => (new Date(b.fecha)).getMonth() == new Date(this.date).getMonth() && (new Date(b.fecha)).getFullYear() == new Date(this.date).getFullYear())
  }

  eliminarCanonArriendo(pag, total){
    var sum = 0;
    pag.cargos?.forEach(c => {if(c.tipo == 'Arriendo' || c.concepto.includes('Reajuste (')) sum += +c.valor})
    return total - sum;
  }

  eliminarCanonLiq(liq, total){
    var sum = 0;
    liq.abonos?.forEach(c => {if(c.concepto == 'Arriendo' || c.concepto.includes('Reajuste (')) sum += +c.valor})
    return total - sum;
  }

  sortData(key){
    if(key == this.sortingProperty) this.ascending = !this.ascending;
    this.sortingProperty = key

    if(key == 'codigo' || key == 'direccion'){
      if (this.ascending){
        this.tableData = this.tableData.sort((a,b) => a[key].replaceAll('.', '') < b[key].replaceAll('.', '') ? 1 : -1)
      }else{
        this.tableData = this.tableData.sort((a,b) => a[key].replaceAll('.', '') < b[key].replaceAll('.', '') ? -1 : 1)
      }
      return
    }

    if (this.ascending){
      this.tableData = this.tableData.sort((a,b) => +a[key].replaceAll('.', '') < +b[key].replaceAll('.', '') ? 1 : -1)
    }else{
      this.tableData = this.tableData.sort((a,b) => +a[key].replaceAll('.', '') < +b[key].replaceAll('.', '') ? -1 : 1)
    }
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
    if (x == 0) return '';

    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

}
