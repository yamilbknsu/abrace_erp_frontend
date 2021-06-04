import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-table-sorter',
  templateUrl: './table-sorter.component.html',
  styleUrls: ['./table-sorter.component.css']
})
export class TableSorterComponent implements OnInit {

  @Input() headers: Array<any>;
  @Input() data: Array<any>;
  @Output() sorted = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  clicked(h){
    this.sorted.emit(h.key)
  }

}
