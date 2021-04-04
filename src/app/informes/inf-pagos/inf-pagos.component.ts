import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-inf-pagos',
  templateUrl: './inf-pagos.component.html',
  styleUrls: ['./inf-pagos.component.css']
})
export class InfPagosComponent implements OnInit {
  
  outputFileName: string = 'document.pdf';

  @ViewChild('pdfViewer') public pdfViewer;

  constructor() { }

  ngOnInit(): void {
  }

}
