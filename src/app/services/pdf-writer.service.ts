import { Injectable } from '@angular/core';
import { jsPDF, jsPDFOptions } from "jspdf";
import autoTable from 'jspdf-autotable'
import * as moment from 'moment';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PdfWriterService {

  constructor(private toastService: ToastService) { }

  generateBlobPdfFromData(head, body, titulo, fecha, styles, columnStyles){
    const options: jsPDFOptions = {format: 'letter', unit: 'px', hotfixes: ['px_scaling']}
    var doc = new jsPDF(options);
    autoTable(doc, {
              head,
              body,
              styles,
              columnStyles,
              didDrawPage: (data) => {
                var pageSize = doc.internal.pageSize;
                doc.setFontSize(12);
                doc.setFont("Roboto-Regular", "normal");
                doc.setTextColor('black');
                doc.text('BRAVO PROPIEDADES', data.settings.margin.left, 50);
                doc.text('PROVIDENCIA 2133 OF. 310', data.settings.margin.left, 70);
                doc.addImage('assets/icon/logoabrace.jpg', 'JPEG', pageSize.getWidth() / 2 - 30, 20, 60, 60)
                
                doc.text(titulo, pageSize.getWidth()/2, 120, {align: 'center'})
                const textWidth = doc.getTextWidth(titulo);
                doc.setDrawColor('black')
                doc.setLineWidth(1);
                doc.line(pageSize.getWidth()/2 - textWidth/2, 122, pageSize.getWidth()/2 + textWidth/2, 122);

                doc.setFontSize(10);
                doc.setFont("Roboto-Bold", "bold");
                doc.text('Fecha: ' + fecha, pageSize.getWidth() - data.settings.margin.right, 50, {align: 'right'});
                doc.text('Página: ' + doc.getNumberOfPages(), pageSize.getWidth() - data.settings.margin.right, 70, {align: 'right'});
              },
              margin: { top: 150 },
              theme: 'plain'});
    return doc.output('blob');
  }

  generateBlobPdfFromPago(fecha, propiedad, contrato, pago, ingresosegresos=undefined, copia=false){
    const options: jsPDFOptions = {format: 'letter', unit: 'px', hotfixes: ['px_scaling']}
    var doc = new jsPDF(options);

    var pageSize = doc.internal.pageSize;

    doc.addImage('assets/icon/logoabrace.jpg', 'JPEG', 50, 30, 60, 60);
    
    doc.setFontSize(18);
    doc.setTextColor('black');
    doc.setFont("Roboto-Bold", "bold");

    const titletext = (copia ? 'Copia de c' : 'C') + 'omprobante de pago'
    const textWidth = doc.getTextWidth(titletext);
    doc.text(titletext, pageSize.getWidth() - 50, 60, {align: 'right'});
    doc.setDrawColor('black')
    doc.setLineWidth(1);
    doc.line(pageSize.getWidth() - 50 - textWidth, 63, pageSize.getWidth() - 50, 63);

    doc.setFontSize(12);
    doc.setFont("Roboto-Regular", "normal");
    doc.text(`${propiedad.uId}     №    ${this.padNumber(pago.nropago)}`, pageSize.getWidth() - 50, 90, {align: 'right'});
    
    doc.text(`Periodo: ${this.formatPeriodo(pago.fechaemision)}`, pageSize.getWidth() - 50, 110, {align: 'right'});

    doc.setFont("Roboto-Bold", "bold");
    doc.text('Mandante', 50, 130);
    doc.text('Propiedad', 50, 150);
    doc.text('Arrendatario', 50, 170);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), 130);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), 150);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), 170);

    doc.setFont("Roboto-Regular", "normal");
    doc.text(propiedad.mandanteData.nombre + " (RUT: " + propiedad.mandanteData.rut + "-" + propiedad.mandanteData.dv + ")", 70 + doc.getTextWidth('Arrendatario'), 130);
    doc.text(propiedad.direccionStr, 70 + doc.getTextWidth('Arrendatario'), 150);
    doc.text(contrato.arrendatario.nombre, 70 + doc.getTextWidth('Arrendatario'), 170);

    pago.cargos = pago.cargos.map(cargo => {
      cargo.valor = this.numberWithPoints(cargo.valor);
      return cargo
    });

    pago.descuentos = pago.descuentos.map(cargo => {
      cargo.valor = this.numberWithPoints(cargo.valor);
      return cargo
    });

    pago.totalCargos = this.numberWithPoints(pago.totalCargos);
    pago.totalDescuentos = this.numberWithPoints(pago.totalDescuentos);
    pago.subtotal = this.numberWithPoints(pago.subtotal);

    var nestedTableHeight = 140
    var tableDelta = 60;
    var nestedTableCell = {
      content: '',
      styles: { minCellHeight: nestedTableHeight },
    }
    autoTable(doc, {
      theme: 'grid',
      head: [['Cargos', 'Descuentos']],
      body: [[nestedTableCell]],
      startY: 190,
      styles: { fillColor: false, textColor: 'black', halign: 'center', minCellWidth: (pageSize.getWidth() - 110) / 2,
                lineWidth: 1, lineColor: 'black'},
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.row.index === 0 && data.row.section === 'body') {
          autoTable(doc, {
            startY: data.cell.y + 2,
            margin: { left: data.cell.x + 2 },
            tableWidth: data.cell.width - 4,
            theme: 'plain',
            styles: {cellPadding: 2, fontSize: 10},
            columns: [
              { dataKey: 'concepto', header: '' },
              { dataKey: 'valor', header: '' },
            ],
            columnStyles: { concepto: { cellWidth: 'auto' }, valor: {halign: 'right'}},
            body: pago.cargos.map(cargo => {
              if(cargo.tipo == 'Arriendo' || cargo.tipo == 'Mes garantía')
                return {concepto: cargo.tipo, valor: cargo.valor}
              else
                return {concepto: cargo.concepto, valor: cargo.valor}
            }),
          });
        }

        if (data.column.index === 1 && data.row.index === 0 && data.row.section === 'body') {
          autoTable(doc, {
            startY: data.cell.y + 2,
            margin: { left: data.cell.x + 2 },
            tableWidth: data.cell.width - 4,
            theme: 'plain',
            styles: {cellPadding: 2, fontSize: 10},
            columnStyles: { concepto: { cellWidth: 'auto' }, valor: {halign: 'right'}},
            columns: [
              { dataKey: 'concepto', header: '' },
              { dataKey: 'valor', header: '' },
            ],
            body: pago.descuentos.map(cargo => ({concepto: cargo.detalle, valor: cargo.valor})),
          });
        }
      },
    });
    
    doc.setFont("Roboto-Bold", "bold");
    doc.text('TOTAL CARGOS', 54, 180 + nestedTableHeight + tableDelta);
    doc.text('TOTAL DESCUENTOS', (pageSize.getWidth() - 110) / 2 + 58, 180 + nestedTableHeight + tableDelta);
    doc.text('SUBTOTAL', (pageSize.getWidth() - 110) / 2 + 58, 180 + nestedTableHeight + tableDelta + 35);
    
    doc.setDrawColor('black')
    doc.setLineWidth(1);
    doc.line((pageSize.getWidth() - 100) / 2 + 50, 180 + nestedTableHeight + tableDelta - 21,
             (pageSize.getWidth() - 100) / 2 + 50, 180 + nestedTableHeight + tableDelta + 12);
    doc.line(53, 180 + nestedTableHeight + tableDelta + 12,
             pageSize.getWidth() - 52, 180 + nestedTableHeight + tableDelta + 12);
      
    doc.line(53, 180 + nestedTableHeight + tableDelta - 21,
             53, 180 + nestedTableHeight + tableDelta + 12);

    doc.line(pageSize.getWidth() - 53, 180 + nestedTableHeight + tableDelta - 21,
             pageSize.getWidth() - 53, 180 + nestedTableHeight + tableDelta + 12);

    doc.setFont("Roboto-Regular", "normal");
    doc.text(pago.totalCargos, (pageSize.getWidth() - 110) / 2 + 50, 180 + nestedTableHeight + tableDelta, {align: 'right'});
    doc.text(pago.totalDescuentos, pageSize.getWidth() - 60, 180 + nestedTableHeight + tableDelta, {align: 'right'});
    doc.text(pago.subtotal, pageSize.getWidth() - 60, 180 + nestedTableHeight + tableDelta + 35, {align: 'right'});
    
    doc.setFontSize(10);
    doc.text(`Cancelado con ${pago.formapago} Nro ${pago.documento} del bco ${pago.banco}`, 50, 180 + nestedTableHeight + tableDelta + 55)
    doc.text(`Depositado en cta ${pago.depositadoen} del bco ${pago.bancoen}`, 50, 180 + nestedTableHeight + tableDelta + 75)
    doc.text(`Obs.: ${pago.observaciones ? pago.observaciones : ''}`, 50, 180 + nestedTableHeight + tableDelta + 95);
    
    doc.setFont("Roboto-Bold", "bold");
    doc.text(`${this.formatFecha(pago.fechapago)}`, 50, 180 + nestedTableHeight + tableDelta + 115)
    //doc.text(`Fecha de hoy: ${this.formatDate(fecha)}`, 50, 180 + nestedTableHeight + tableDelta + 135)

    doc.setFont("Roboto-Regular", "normal");
    doc.setFontSize(13);
    doc.text('RECIBI CONFORME', pageSize.getWidth() - 60, 180 + nestedTableHeight + tableDelta + 115, {align: "right"})
    
    doc.setDrawColor('black')
    doc.setLineWidth(2);
    doc.setLineDashPattern([3], 0);
    doc.line(53, 180 + nestedTableHeight + tableDelta + 135, pageSize.getWidth() - 53, 180 + nestedTableHeight + tableDelta + 135);

    // DESDE AQUI LA COPIA
    // ----------------------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------------------

    var startY = 180 + nestedTableHeight + tableDelta + 140;

    doc.addImage('assets/icon/logoabrace.jpg', 'JPEG', 50, startY + 30, 60, 60);
    
    doc.setFontSize(18);
    doc.setTextColor('black');
    doc.setFont("Roboto-Bold", "bold");

    doc.text(titletext, pageSize.getWidth() - 50, startY + 60, {align: 'right'});

    doc.setDrawColor('black')
    doc.setLineWidth(1);
    doc.setLineDashPattern([], 0);
    doc.line(pageSize.getWidth() - 50 - textWidth, startY + 63, pageSize.getWidth() - 50, startY + 63);

    doc.setFontSize(12);
    doc.setFont("Roboto-Regular", "normal");
    doc.text(`${propiedad.uId}     №    ${this.padNumber(pago.nropago)}`, pageSize.getWidth() - 50, startY + 90, {align: 'right'});

    doc.text(`Periodo: ${this.formatPeriodo(pago.fechaemision)}`, pageSize.getWidth() - 50, startY + 110, {align: 'right'});

    doc.setFont("Roboto-Bold", "bold");
    doc.text('Mandante', 50, startY + 130);
    doc.text('Propiedad', 50, startY + 150);
    doc.text('Arrendatario', 50, startY + 170);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), startY + 130);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), startY + 150);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), startY + 170);

    doc.setFont("Roboto-Regular", "normal");
    doc.text(propiedad.mandanteData.nombre + " (RUT: " + propiedad.mandanteData.rut + "-" + propiedad.mandanteData.dv + ")", 70 + doc.getTextWidth('Arrendatario'), startY + 130);
    doc.text(propiedad.direccionStr, 70 + doc.getTextWidth('Arrendatario'), startY + 150);
    doc.text(contrato.arrendatario.nombre, 70 + doc.getTextWidth('Arrendatario'), startY + 170);

    var nestedTableCell = {
      content: '',
      // Dynamic height of nested tables are not supported right now
      // so we need to define height of the parent cell
      styles: { minCellHeight: nestedTableHeight },
    }
    autoTable(doc, {
      theme: 'grid',
      head: [['Cargos', 'Descuentos']],
      body: [[nestedTableCell]],
      startY: startY + 190,
      styles: { fillColor: false, textColor: 'black', halign: 'center', minCellWidth: (pageSize.getWidth() - 110) / 2,
                lineWidth: 1, lineColor: 'black'},
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.row.index === 0 && data.row.section === 'body') {
          autoTable(doc, {
            startY: data.cell.y + 2,
            margin: { left: data.cell.x + 2 },
            tableWidth: data.cell.width - 4,
            theme: 'plain',
            styles: {cellPadding: 2, fontSize: 10},
            columns: [
              { dataKey: 'concepto', header: '' },
              { dataKey: 'valor', header: '' },
            ],
            columnStyles: { concepto: { cellWidth: 'auto' }, valor: {halign: 'right'}},
            body: pago.cargos.map(cargo => {
              if(cargo.tipo == 'Arriendo' || cargo.tipo == 'Mes garantía')
                return {concepto: cargo.tipo, valor: cargo.valor}
              else
                return {concepto: cargo.concepto, valor: cargo.valor}
            }),
          });
        }

        if (data.column.index === 1 && data.row.index === 0 && data.row.section === 'body') {
          autoTable(doc, {
            startY: data.cell.y + 2,
            margin: { left: data.cell.x + 2 },
            tableWidth: data.cell.width - 4,
            theme: 'plain',
            styles: {cellPadding: 2, fontSize: 10},
            columnStyles: { concepto: { cellWidth: 'auto' }, valor: {halign: 'right'}},
            columns: [
              { dataKey: 'concepto', header: '' },
              { dataKey: 'valor', header: '' },
            ],
            body: pago.descuentos.map(cargo => ({concepto: cargo.detalle, valor: cargo.valor})),
          });
        }
      },
    });
    
    doc.setFont("Roboto-Bold", "bold");
    doc.text('TOTAL CARGOS', 54, startY + 180 + nestedTableHeight + tableDelta);
    doc.text('TOTAL DESCUENTOS', (pageSize.getWidth() - 110) / 2 + 58, startY + 180 + nestedTableHeight + tableDelta);
    doc.text('SUBTOTAL', (pageSize.getWidth() - 110) / 2 + 58, startY + 180 + nestedTableHeight + tableDelta + 35);
    
    doc.setDrawColor('black')
    doc.setLineWidth(1);
    doc.line((pageSize.getWidth() - 100) / 2 + 50, startY + 180 + nestedTableHeight + tableDelta - 21,
             (pageSize.getWidth() - 100) / 2 + 50, startY + 180 + nestedTableHeight + tableDelta + 12);
    doc.line(53, startY + 180 + nestedTableHeight + tableDelta + 12,
             pageSize.getWidth() - 52, startY + 180 + nestedTableHeight + tableDelta + 12);
      
    doc.line(53, startY + 180 + nestedTableHeight + tableDelta - 21,
             53, startY + 180 + nestedTableHeight + tableDelta + 12);

    doc.line(pageSize.getWidth() - 53, startY + 180 + nestedTableHeight + tableDelta - 21,
             pageSize.getWidth() - 53, startY + 180 + nestedTableHeight + tableDelta + 12);

    doc.setFont("Roboto-Regular", "normal");
    doc.text(pago.totalCargos, (pageSize.getWidth() - 110) / 2 + 50, startY + 180 + nestedTableHeight + tableDelta, {align: 'right'});
    doc.text(pago.totalDescuentos, pageSize.getWidth() - 60, startY + 180 + nestedTableHeight + tableDelta, {align: 'right'});
    doc.text(pago.subtotal, pageSize.getWidth() - 60, startY + 180 + nestedTableHeight + tableDelta + 35, {align: 'right'});
    
    doc.setFontSize(10);
    doc.text(`Cancelado con ${pago.formapago} Nro ${pago.documento} del bco ${pago.banco}`, 50, startY + 180 + nestedTableHeight + tableDelta + 55)
    doc.text(`Depositado en cta ${pago.depositadoen} del bco ${pago.bancoen}`, 50, startY + 180 + nestedTableHeight + tableDelta + 75)
    doc.text(`Obs.: ${pago.observaciones ? pago.observaciones : ''}`, 50, startY + 180 + nestedTableHeight + tableDelta + 95);
    
    doc.setFont("Roboto-Bold", "bold");
    doc.text(`${this.formatFecha(pago.fechapago)}`, 50, startY + 180 + nestedTableHeight + tableDelta + 115)
    //doc.text(`Fecha de hoy: ${this.formatDate(fecha)}`, 50, 180 + nestedTableHeight + tableDelta + 135)

    doc.setFont("Roboto-Regular", "normal");
    doc.setFontSize(13);
    doc.text('RECIBI CONFORME', pageSize.getWidth() - 60, startY + 180 + nestedTableHeight + tableDelta + 115, {align: "right"})
    
    if(ingresosegresos?.ingresos)
      var [doc_aux, lastY] = this.addIngresosEgresos(doc, ingresosegresos.ingresos);

    doc = doc_aux ? doc_aux : doc;

    if(ingresosegresos?.egresos)
      var [doc_aux_2, lastY_2] = this.addIngresosEgresos(doc, ingresosegresos.egresos, !lastY, false, lastY? lastY : 0);

    doc = doc_aux_2 ? doc_aux_2 : doc; 
    
    return doc.output('blob');
  }

  generateBlobPdfFromLiquidacion(fecha, propiedad, liquidacion, ingresosegresos:any = {}, copia=false){
    const options: jsPDFOptions = {format: 'letter', unit: 'px', hotfixes: ['px_scaling']}
    var doc = new jsPDF(options);

    var pageSize = doc.internal.pageSize;

    doc.addImage('assets/icon/logoabrace.jpg', 'JPEG', 50, 30, 60, 60);
    
    doc.setFontSize(18);
    doc.setTextColor('black');
    doc.setFont("Roboto-Bold", "bold");

    const titletext = (copia ? 'Copia de r' : 'R') + 'ecibo de liquidación de arriendo'
    const textWidth = doc.getTextWidth(titletext);
    doc.text(titletext, pageSize.getWidth() - 50, 60, {align: 'right'});
    doc.setDrawColor('black')
    doc.setLineWidth(1);
    doc.line(pageSize.getWidth() - 50 - textWidth, 63, pageSize.getWidth() - 50, 63);

    doc.setFontSize(12);
    doc.setFont("Roboto-Regular", "normal");
    doc.text(`${propiedad.uId}     №    ${this.padNumber(liquidacion.nroliquidacion)}`, pageSize.getWidth() - 50, 90, {align: 'right'});

    doc.text(`Periodo: ${this.formatPeriodo(liquidacion.fecha)}`, pageSize.getWidth() - 50, 110, {align: 'right'});

    doc.setFont("Roboto-Bold", "bold");
    doc.text('Mandante', 50, 130);
    doc.text('Propiedad', 50, 150);
    doc.text('Arrendatario', 50, 170);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), 130);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), 150);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), 170);

    doc.setFont("Roboto-Regular", "normal");
    doc.text(propiedad.mandanteData.nombre + " (RUT: " + propiedad.mandanteData.rut + "-" + propiedad.mandanteData.dv + ")", 70 + doc.getTextWidth('Arrendatario'), 130);
    doc.text(propiedad.direccionStr, 70 + doc.getTextWidth('Arrendatario'), 150);
    doc.text(propiedad.arrendatario, 70 + doc.getTextWidth('Arrendatario'), 170);

    liquidacion.cargos = liquidacion.cargos.map(cargo => {
      cargo.valor = this.numberWithPoints(cargo.valor);
      return cargo
    });

    liquidacion.abonos = liquidacion.abonos.map(cargo => {
      cargo.valor = this.numberWithPoints(cargo.valor);
      return cargo
    });

    liquidacion.totalCargos = this.numberWithPoints(liquidacion.totalCargos);
    liquidacion.totalAbonos = this.numberWithPoints(liquidacion.totalAbonos);
    liquidacion.subtotal = this.numberWithPoints(liquidacion.subtotal);

    liquidacion.honorarios.valor = this.numberWithPoints(liquidacion.honorarios.valor);
    liquidacion.honorarios.impuestos = this.numberWithPoints(liquidacion.honorarios.impuestos);

    var cargoshonorarios = liquidacion.cargos.map(cargo => ({concepto: cargo.concepto, valor: cargo.valor}));
    cargoshonorarios.unshift({concepto: 'Impuestos', valor: liquidacion.honorarios.impuestos})
    cargoshonorarios.unshift({concepto: 'Honorarios (' + liquidacion.honorarios.descripcion + ')', valor: liquidacion.honorarios.valor})

    var nestedTableHeight = 140
    var tableDelta = 60;
    var nestedTableCell = {
      content: '',
      // Dynamic height of nested tables are not supported right now
      // so we need to define height of the parent cell
      styles: { minCellHeight: nestedTableHeight },
    }
    autoTable(doc, {
      theme: 'grid',
      head: [['Abonos', 'Cargos']],
      body: [[nestedTableCell]],
      startY: 190,
      styles: { fillColor: false, textColor: 'black', halign: 'center', minCellWidth: (pageSize.getWidth() - 110) / 2,
                lineWidth: 1, lineColor: 'black'},
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.row.index === 0 && data.row.section === 'body') {
          autoTable(doc, {
            startY: data.cell.y + 2,
            margin: { left: data.cell.x + 2 },
            tableWidth: data.cell.width - 4,
            theme: 'plain',
            styles: {cellPadding: 2, fontSize: 10},
            columns: [
              { dataKey: 'concepto', header: '' },
              { dataKey: 'valor', header: '' },
            ],
            columnStyles: { concepto: { cellWidth: 'auto' }, valor: {halign: 'right'}},
            body: liquidacion.abonos.map(cargo => {
                return {concepto: cargo.concepto, valor: cargo.valor}
            }),
          });
        }

        if (data.column.index === 1 && data.row.index === 0 && data.row.section === 'body') {
          autoTable(doc, {
            startY: data.cell.y + 2,
            margin: { left: data.cell.x + 2 },
            tableWidth: data.cell.width - 4,
            theme: 'plain',
            styles: {cellPadding: 2, fontSize: 10},
            columnStyles: { concepto: { cellWidth: 'auto' }, valor: {halign: 'right'}},
            columns: [
              { dataKey: 'concepto', header: '' },
              { dataKey: 'valor', header: '' },
            ],
            body: cargoshonorarios,
          });
        }
      },
    });

    doc.setFont("Roboto-Bold", "bold");
    doc.text('TOTAL ABONOS', 54, 180 + nestedTableHeight + tableDelta);
    doc.text('TOTAL CARGOS', (pageSize.getWidth() - 110) / 2 + 58, 180 + nestedTableHeight + tableDelta);
    doc.text('SUBTOTAL', (pageSize.getWidth() - 110) / 2 + 58, 180 + nestedTableHeight + tableDelta + 35);
    
    doc.setDrawColor('black')
    doc.setLineWidth(1);
    doc.line((pageSize.getWidth() - 100) / 2 + 50, 180 + nestedTableHeight + tableDelta - 21,
             (pageSize.getWidth() - 100) / 2 + 50, 180 + nestedTableHeight + tableDelta + 12);
    doc.line(53, 180 + nestedTableHeight + tableDelta + 12,
             pageSize.getWidth() - 52, 180 + nestedTableHeight + tableDelta + 12);
      
    doc.line(53, 180 + nestedTableHeight + tableDelta - 21,
             53, 180 + nestedTableHeight + tableDelta + 12);

    doc.line(pageSize.getWidth() - 53, 180 + nestedTableHeight + tableDelta - 21,
             pageSize.getWidth() - 53, 180 + nestedTableHeight + tableDelta + 12);

    doc.setFont("Roboto-Regular", "normal");
    doc.text(liquidacion.totalAbonos, (pageSize.getWidth() - 110) / 2 + 50, 180 + nestedTableHeight + tableDelta, {align: 'right'});
    doc.text(liquidacion.totalCargos, pageSize.getWidth() - 60, 180 + nestedTableHeight + tableDelta, {align: 'right'});
    doc.text(liquidacion.subtotal, pageSize.getWidth() - 60, 180 + nestedTableHeight + tableDelta + 35, {align: 'right'});
    
    doc.setFontSize(10);
    doc.text(`Cancelado con ${liquidacion.formapago} Nro/Cta. ${liquidacion.documento} del bco ${liquidacion.banco}`, 50, 180 + nestedTableHeight + tableDelta + 55)
    doc.text(`Obs.: ${liquidacion.observaciones ? liquidacion.observaciones : ''}`, 50, 180 + nestedTableHeight + tableDelta + 75);

    doc.setFont("Roboto-Bold", "bold");
    doc.text(`${this.formatFecha(liquidacion.fecha)}`, 50, 180 + nestedTableHeight + tableDelta + 95)

    doc.setFont("Roboto-Regular", "normal");
    doc.setFontSize(13);
    doc.text('RECIBI CONFORME', pageSize.getWidth() - 60, 180 + nestedTableHeight + tableDelta + 115, {align: "right"})
    
    doc.setDrawColor('black')
    doc.setLineWidth(2);
    doc.setLineDashPattern([3], 0);
    doc.line(53, 180 + nestedTableHeight + tableDelta + 135, pageSize.getWidth() - 53, 180 + nestedTableHeight + tableDelta + 135);
    

    // DESDE AQUI LA COPIA
    // ----------------------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------------------


    var startY = 180 + nestedTableHeight + tableDelta + 150;

    doc.addImage('assets/icon/logoabrace.jpg', 'JPEG', 50, startY + 30, 60, 60);
    
    doc.setFontSize(18);
    doc.setTextColor('black');
    doc.setFont("Roboto-Bold", "bold");

    doc.text(titletext, pageSize.getWidth() - 50, startY + 60, {align: 'right'});

    doc.setDrawColor('black')
    doc.setLineWidth(1);
    doc.setLineDashPattern([], 0);
    doc.line(pageSize.getWidth() - 50 - textWidth, startY + 63, pageSize.getWidth() - 50, startY + 63);

    doc.setFontSize(12);
    doc.setFont("Roboto-Regular", "normal");
    doc.text(`${propiedad.uId}     №    ${this.padNumber(liquidacion.nroliquidacion)}`, pageSize.getWidth() - 50, startY + 90, {align: 'right'});

    doc.text(`Periodo: ${this.formatPeriodo(liquidacion.fecha)}`, pageSize.getWidth() - 50, startY + 110, {align: 'right'});

    doc.setFont("Roboto-Bold", "bold");
    doc.text('Mandante', 50, startY + 130);
    doc.text('Propiedad', 50, startY + 150);
    doc.text('Arrendatario', 50, startY + 170);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), startY + 130);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), startY + 150);
    doc.text(':', 55 + doc.getTextWidth('Arrendatario'), startY + 170);

    doc.setFont("Roboto-Regular", "normal");
    doc.text(propiedad.mandanteData.nombre + " (RUT: " + propiedad.mandanteData.rut + "-" + propiedad.mandanteData.dv + ")", 70 + doc.getTextWidth('Arrendatario'), startY + 130);
    doc.text(propiedad.direccionStr, 70 + doc.getTextWidth('Arrendatario'), startY + 150);
    doc.text(propiedad.arrendatario, 70 + doc.getTextWidth('Arrendatario'), startY + 170);

    var nestedTableCell = {
      content: '',
      // Dynamic height of nested tables are not supported right now
      // so we need to define height of the parent cell
      styles: { minCellHeight: nestedTableHeight },
    }
    autoTable(doc, {
      theme: 'grid',
      head: [['Abonos', 'Cargos']],
      body: [[nestedTableCell]],
      startY: startY + 190,
      styles: { fillColor: false, textColor: 'black', halign: 'center', minCellWidth: (pageSize.getWidth() - 110) / 2,
                lineWidth: 1, lineColor: 'black'},
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.row.index === 0 && data.row.section === 'body') {
          autoTable(doc, {
            startY: data.cell.y + 2,
            margin: { left: data.cell.x + 2 },
            tableWidth: data.cell.width - 4,
            theme: 'plain',
            styles: {cellPadding: 2, fontSize: 10},
            columns: [
              { dataKey: 'concepto', header: '' },
              { dataKey: 'valor', header: '' },
            ],
            columnStyles: { concepto: { cellWidth: 'auto' }, valor: {halign: 'right'}},
            body: liquidacion.abonos.map(cargo => {
              return {concepto: cargo.concepto, valor: cargo.valor}
            }),
          });
        }

        if (data.column.index === 1 && data.row.index === 0 && data.row.section === 'body') {
          autoTable(doc, {
            startY: data.cell.y + 2,
            margin: { left: data.cell.x + 2 },
            tableWidth: data.cell.width - 4,
            theme: 'plain',
            styles: {cellPadding: 2, fontSize: 10},
            columnStyles: { concepto: { cellWidth: 'auto' }, valor: {halign: 'right'}},
            columns: [
              { dataKey: 'concepto', header: '' },
              { dataKey: 'valor', header: '' },
            ],
            body: cargoshonorarios,
          });
        }
      },
    });
    
    doc.setFont("Roboto-Bold", "bold");
    doc.text('TOTAL ABONOS', 54, startY + 180 + nestedTableHeight + tableDelta);
    doc.text('TOTAL CARGOS', (pageSize.getWidth() - 110) / 2 + 58, startY + 180 + nestedTableHeight + tableDelta);
    doc.text('SUBTOTAL', (pageSize.getWidth() - 110) / 2 + 58, startY + 180 + nestedTableHeight + tableDelta + 35);
    
    doc.setDrawColor('black')
    doc.setLineWidth(1);
    doc.line((pageSize.getWidth() - 100) / 2 + 50, startY + 180 + nestedTableHeight + tableDelta - 21,
             (pageSize.getWidth() - 100) / 2 + 50, startY + 180 + nestedTableHeight + tableDelta + 12);
    doc.line(53, startY + 180 + nestedTableHeight + tableDelta + 12,
             pageSize.getWidth() - 52, startY + 180 + nestedTableHeight + tableDelta + 12);
      
    doc.line(53, startY + 180 + nestedTableHeight + tableDelta - 21,
             53, startY + 180 + nestedTableHeight + tableDelta + 12);

    doc.line(pageSize.getWidth() - 53, startY + 180 + nestedTableHeight + tableDelta - 21,
             pageSize.getWidth() - 53, startY + 180 + nestedTableHeight + tableDelta + 12);

    doc.setFont("Roboto-Regular", "normal");
    doc.text(liquidacion.totalAbonos, (pageSize.getWidth() - 110) / 2 + 50, startY + 180 + nestedTableHeight + tableDelta, {align: 'right'});
    doc.text(liquidacion.totalCargos, pageSize.getWidth() - 60, startY + 180 + nestedTableHeight + tableDelta, {align: 'right'});
    doc.text(liquidacion.subtotal, pageSize.getWidth() - 60, startY + 180 + nestedTableHeight + tableDelta + 35, {align: 'right'});
    
    doc.setFontSize(10);
    doc.text(`Cancelado con ${liquidacion.formapago} Nro/Cta. ${liquidacion.documento} del bco ${liquidacion.banco}`, 50, startY + 180 + nestedTableHeight + tableDelta + 55)
    doc.text(`Obs.: ${liquidacion.observaciones ? liquidacion.observaciones : ''}`, 50, startY + 180 + nestedTableHeight + tableDelta + 75);
      
    doc.setFont("Roboto-Bold", "bold");
    doc.text(`${this.formatFecha(liquidacion.fecha)}`, 50, startY + 180 + nestedTableHeight + tableDelta + 95)

    doc.setFont("Roboto-Regular", "normal");
    doc.setFontSize(13);
    doc.text('RECIBI CONFORME', pageSize.getWidth() - 60, startY + 180 + nestedTableHeight + tableDelta + 115, {align: "right"})

    if(ingresosegresos.ingresos)
      var [doc_aux, lastY] = this.addIngresosEgresos(doc, ingresosegresos.ingresos);

    doc = doc_aux ? doc_aux : doc;

    if(ingresosegresos.egresos)
      var [doc_aux_2, lastY_2] = this.addIngresosEgresos(doc, ingresosegresos.egresos, !lastY, false, lastY? lastY : 0);

    doc = doc_aux_2 ? doc_aux_2 : doc; 
    return doc.output('blob');
  }

  addIngresosEgresos(doc, data, addPage=true, ingresos=true, startY = 0){
    if(!data || data.length == 0) return [doc, startY];

    const plural = ingresos ? 'Ingresos' : 'Egresos';
    const singular = ingresos ? 'Ingreso' : 'Egreso';
    const marginY = 60;

    if(addPage) doc.addPage();

    doc.setFont("Roboto-Bold", "bold");
    doc.setFontSize(14);
    doc.text('Detalle ' + plural, 50, startY + marginY);

    var lastY = startY + marginY + 20;

    data.forEach(element => {
      doc.setFont("Roboto-Bold", "bold");
      doc.setFontSize(13);
      doc.text(singular + ' № ' + this.padNumber(ingresos ? element.nroingreso : element.nroegreso), 50, lastY + 10);

      doc.setFont("Roboto-Regular", "normal");
      doc.setFontSize(11);
      doc.text(`Periodo: ${this.formatPeriodo(element.periodo)}`, 50, lastY + 35);
      doc.text(`Fecha pago: ${this.formatFecha(element.fecha)}`, 50, lastY + 55);

      autoTable(doc, {
          startY: lastY + 75,
          theme: 'grid',
          columns: [
            { dataKey: 'concepto', header: 'Concepto' },
            { dataKey: 'valor', header: 'Valor' },
          ],
          body: element.conceptos,
          styles: {
            fillColor: false,
            textColor: 'black',
            lineColor: 'black',
            lineWidth: 1,
            cellWidth: 'wrap'
          },
          columnStyles: {
            concepto: {
              cellWidth: 'auto'
            },
            valor: {
              halign: 'right'
            }
        }
      });

      lastY = doc.autoTable.previous.finalY + 20;
      doc.text(`Forma de pago: ${element.formapago}`, 50, lastY + 10);
      
      var str = element.formapago == 'Cheque' ? `Documento: ${element.documento ? element.documento : ''}` : 
                                                `Cuenta: ${element.cuenta ? element.cuenta : ''}`
      
      if(element.formapago != 'Efectivo')
        doc.text(`${str} Banco: ${element.banco ? element.banco : ''}`, 50, lastY + 30);
      
        lastY = lastY + 50
    });

    return [doc, lastY - 50];
  }

  generateIngresoEgreso(data, propiedad, ingresos=true, copia=false){
    if(!data || data.length == 0) return doc;

    const plural = ingresos ? 'Ingresos' : 'Egresos';
    const singular = ingresos ? 'Ingreso' : 'Egreso';
    const marginY = 60;

    const options: jsPDFOptions = {format: 'letter', unit: 'px', hotfixes: ['px_scaling']}
    var doc:any = new jsPDF(options);

    var pageSize = doc.internal.pageSize;

    doc.addImage('assets/icon/logoabrace.jpg', 'JPEG', 50, 30, 60, 60);
    
    doc.setFontSize(18);
    doc.setTextColor('black');
    doc.setFont("Roboto-Bold", "bold");
    
    if(!copia){
      const textWidth = doc.getTextWidth(`Comprobante de ${singular}`);
      doc.text(`Comprobante de ${singular}`, pageSize.getWidth() - 50, 60, {align: 'right'});
      doc.setDrawColor('black');
      doc.setLineWidth(1);
      doc.line(pageSize.getWidth() - 50 - textWidth, 63, pageSize.getWidth() - 50, 63);
    }else{
      const textWidth = doc.getTextWidth(`Copia de comprobante de ${singular}`);
      doc.text(`Copia de comprobante de ${singular}`, pageSize.getWidth() - 50, 60, {align: 'right'});
      doc.setDrawColor('black');
      doc.setLineWidth(1);
      doc.line(pageSize.getWidth() - 50 - textWidth, 63, pageSize.getWidth() - 50, 63);
    }

    var startY = 60;

    doc.setFont("Roboto-Bold", "bold");
    doc.setFontSize(14);

    var lastY = startY + marginY + 20;

    data.forEach(element => {
      doc.setFont("Roboto-Bold", "bold");
      doc.setFontSize(13);
      doc.text(singular + ' № ' + this.padNumber(ingresos ? element.nroingreso : element.nroegreso), 50, lastY + 10);

      doc.setFont("Roboto-Regular", "normal");
      doc.setFontSize(11);
      doc.text(`Propiedad: ${propiedad.uId} - ${propiedad.direccionStr}`, 50, lastY + 35);
      doc.text(`Periodo: ${this.formatPeriodo(element.periodo)}`, 50, lastY + 55);
      doc.text(`Fecha pago: ${this.formatFecha(element.fecha)}`, 50, lastY + 75);

      autoTable(doc, {
          startY: lastY + 95,
          theme: 'grid',
          columns: [
            { dataKey: 'concepto', header: 'Concepto' },
            { dataKey: 'valor', header: 'Valor' },
          ],
          body: element.conceptos,
          styles: {
            fillColor: false,
            textColor: 'black',
            lineColor: 'black',
            lineWidth: 1,
            cellWidth: 'wrap'
          },
          columnStyles: {
            concepto: {
              cellWidth: 'auto'
            },
            valor: {
              halign: 'right'
            }
        }
      });

      lastY = doc.autoTable.previous.finalY + 20;
      doc.text(`Forma de pago: ${element.formapago ? element.formapago : ''}`, 50, lastY + 10);
      
      var str = element.formapago == 'Cheque' ? `Documento: ${element.documento ? element.documento : ''}` : 
                                                `Cuenta: ${element.cuenta ? element.cuenta : ''}`
      
      if(element.formapago != 'Efectivo')
        doc.text(`${str} Banco: ${element.banco ? element.banco : ''}`, 50, lastY + 30);
      
      lastY = lastY + 80
      doc.setFont("Roboto-Regular", "normal");
      doc.setFontSize(13);
      doc.text('RECIBI CONFORME', pageSize.getWidth() - 60, lastY, {align: "right"})

    });
    
    return doc.output('blob');
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

  numberWithPoints(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  formatPeriodo(date, sep='/') {
    if(!date) return 'Presente';

    return moment(date).locale('es').format('MMM YYYY')
  }

  formatFecha(date, sep='/') {
    if(!date) return 'Presente';

    return moment(date).locale('es').format('DD - MMMM - YYYY').toUpperCase().replace('-', 'de').replace('-', 'de')
  }

  padNumber(number){
    if (number<=9999) { number = ("000"+number).slice(-4); }
    return number;
  }
}