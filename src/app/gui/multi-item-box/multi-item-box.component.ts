import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-multi-item-box',
  templateUrl: './multi-item-box.component.html',
  styleUrls: ['./multi-item-box.component.css']
})
export class MultiItemBoxComponent implements OnInit {

  @Input() items: any[];
  @Output() updateArray: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();
  @Output() updateSelection: EventEmitter<number> = new EventEmitter<number>();

  selectedIndex: number = -1;

  insertedText: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  selectOption(index: number){
    this.selectedIndex = index;
    this.updateSelection.emit(this.selectedIndex);
  }

  deleteItem(){
    if(this.selectedIndex != -1){
      this.items.splice(this.selectedIndex, 1)
      this.updateArray.emit(this.items);
      this.selectedIndex = -1;
    }
  }

  addItem(){
    if(this.insertedText.length > 0){
      this.items.push(this.insertedText);
      this.updateArray.emit(this.items);
      this.selectedIndex = -1;
      this.insertedText = '';
    }
  }

}
