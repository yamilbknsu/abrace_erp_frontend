import { Injectable } from '@angular/core';
import { jsPDF, jsPDFOptions } from "jspdf";
import autoTable from 'jspdf-autotable'

@Injectable({
  providedIn: 'root'
})
export class PdfWriterService {

  constructor() { }

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
}
