import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { Propiedad } from 'src/app/models/Propiedad';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';

@Component({
  selector: 'app-inf-liquidacion',
  templateUrl: './inf-liquidacion.component.html',
  styleUrls: ['./inf-liquidacion.component.css']
})
export class InfLiquidacionComponent implements OnInit {

  date: any;
  
  outputFileName: string = 'document.pdf';

  @ViewChild('pdfViewer') public pdfViewer;
  
  propiedades: any[] = [];
  selectedPropiedadId: string = '';
  selectedPropiedadId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  selectedPropiedad: any = new Propiedad();

  selectedLiquidacion: any = {};
  selectedLiquidacionId: string = '';

  constructor(private route:ActivatedRoute, private pdfWriterService: PdfWriterService) { }

  ngOnInit(): void {
    this.date = moment();

    this.route.data.subscribe(data => {
      this.propiedades = data.propiedades;
      console.log(this.propiedades)
    });

    this.selectedPropiedadId$.subscribe(id => this.selectedPropiedad = this.propiedades.filter(prop => prop._id == id)?.[0]);
  }

  changePropiedad(id){
    this.selectedLiquidacionId = '';
    this.selectedLiquidacion = {};
    if(id) this.selectedPropiedadId$.next(id);
    else this.selectedPropiedadId$.next('');

    if(id){
      this.selectedPropiedad.liquidaciones = this.selectedPropiedad.liquidaciones.map(liq => {
        liq.formatedFecha = this.formatDate(liq.fecha);
        return liq
      });
    }
  }

  changeLiquidacion(){
    this.selectedLiquidacion = this.selectedPropiedad.liquidaciones.filter(liq => liq._id == this.selectedLiquidacionId)?.[0];
  }

  onGenerar(){
    this.outputFileName = `ComprobanteLiquidacion_${this.selectedPropiedad.uId}_${this.formatDate(this.selectedLiquidacion.fecha, '')}.pdf`;

    var blob = this.pdfWriterService.generateBlobPdfFromLiquidacion(this.date, this.selectedPropiedad, this.selectedLiquidacion);

    this.pdfViewer.pdfSrc = blob;
    this.pdfViewer.downloadFileName = this.outputFileName;
    this.pdfViewer.refresh()
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

}
