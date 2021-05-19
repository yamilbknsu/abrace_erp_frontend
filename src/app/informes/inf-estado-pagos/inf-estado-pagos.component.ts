import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-inf-estado-pagos',
  templateUrl: './inf-estado-pagos.component.html',
  styleUrls: ['./inf-estado-pagos.component.css']
})
export class InfEstadoPagosComponent implements OnInit {
  
  date;
  outputFileName: string = 'document.pdf';

  datePickerConfig = {
    locale: 'es'
  }

  @ViewChild('pdfViewer') public pdfViewer;

  constructor() { }

  ngOnInit(): void {
    this.date = moment().locale('es');
  }

  onGenerar(){
    console.log(this.date)
  }

}
