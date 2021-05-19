import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-inf-estado-arriendos',
  templateUrl: './inf-estado-arriendos.component.html',
  styleUrls: ['./inf-estado-arriendos.component.css']
})
export class InfEstadoArriendosComponent implements OnInit {

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
