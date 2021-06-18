import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { AccionesService } from 'src/app/acciones/acciones.service';
import { Propiedad } from 'src/app/models/Propiedad';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { PdfWriterService } from 'src/app/services/pdf-writer.service';

@Component({
  selector: 'app-inf-pagos',
  templateUrl: './inf-pagos.component.html',
  styleUrls: ['./inf-pagos.component.css']
})
export class InfPagosComponent implements OnInit {

  date: any;
  
  outputFileName: string = 'document.pdf';

  @ViewChild('pdfViewer') public pdfViewer;

  selectedPropiedadId: string = '';
  selectedPropiedadId$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  selectedContratoId: string = '';
  selectedContratoId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  selectedPropiedad: any = new Propiedad();
  selectedContrato: any = {};

  selectedPago: any;
  selectedPagoId: string = '';

  propiedades: any[] = [];

  datePickerConfig = {
    locale: 'es'
  }

  sortDate = (a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? -1 : 1;
  sortDateReverse = (a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? 1 : -1;

  constructor(private route: ActivatedRoute, private pdfWriterService: PdfWriterService,
              private accionesService: AccionesService, private propiedadesService: PropiedadesService) { }

  ngOnInit(): void {
    this.date = moment();

    this.route.data.subscribe(data => {
      this.propiedades = data.propiedades;
    });

    this.selectedPropiedadId$.subscribe(id => this.selectedPropiedad = this.propiedades.filter(prop => prop._id == id)?.[0]);
    this.selectedContratoId$.subscribe(id => {
      this.selectedContrato = this.propiedades.filter(prop => prop._id == this.selectedPropiedadId)?.[0]?.contratos.filter(cont => cont._id == id)?.[0]
      //this.boletas = [];
      //this.instrucciones = [];
      console.log(this.selectedContrato);
      if(this.selectedContrato){
        this.selectedContrato.pagos = this.selectedContrato.pagos.sort(this.sortDateReverse);
        this.selectedContrato.pagos = this.selectedContrato.pagos.map(pago => {
          pago.formatedFecha = this.formatDate(pago.fechapago);
          return pago
        });
        //this.instrucciones = this.selectedContrato.instrucciones;
        //this.totalCargos = 0;
        //this.totalDescuentos = 0;
        //this.subtotal = 0;
      }
    });
  }

  changePropiedad(id){
    this.selectedPagoId = '';
    this.selectedContrato = {};
    this.selectedContratoId = '';
    this.selectedContratoId$.next(this.selectedContratoId);
    if(id) this.selectedPropiedadId$.next(id);
    else this.selectedPropiedadId$.next('');

    console.log(this.selectedPropiedad)
  }

  changeContrato(id){
    this.selectedPagoId = '';
    if(id) this.selectedContratoId$.next(id);
    else this.selectedContratoId$.next('');
  }

  changePago(){
    this.selectedPago = this.selectedContrato.pagos.filter(pago => pago._id == this.selectedPagoId)?.[0];
  }

  onGenerar(){
    this.propiedadesService.loadIngresosEgresosPropiedad(this.selectedPropiedadId, new Date(this.selectedPago.fechaemision))
                           .subscribe(data => {
                            this.outputFileName = `ComprobantePago_${this.selectedPropiedad.uId}_${this.formatDate(this.selectedPago.fechaemision, '')}.pdf`;
                              var blob = this.pdfWriterService.generateBlobPdfFromPago(this.date, this.selectedPropiedad, this.selectedContrato, this.selectedPago,
                                {egresos: data.egresos?.filter(egreso => egreso.afectaarriendo),
                                 ingresos: data.ingresos?.filter(ingreso => ingreso.afectaarriendo)}, true);
                          
                              this.pdfViewer.pdfSrc = blob;
                              this.pdfViewer.downloadFileName = this.outputFileName;
                              this.pdfViewer.refresh();
                           });


    var blob = this.pdfWriterService.generateBlobPdfFromPago(this.date, this.selectedPropiedad, this.selectedContrato, this.selectedPago);

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
