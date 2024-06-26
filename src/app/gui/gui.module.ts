import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown/dropdown.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MultiItemBoxComponent } from './multi-item-box/multi-item-box.component';
import {DpDatePickerModule} from 'ng2-date-picker';
import { TableSorterComponent } from './table-sorter/table-sorter.component';



@NgModule({
  declarations: [DropdownComponent, MultiItemBoxComponent, TableSorterComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    DpDatePickerModule
  ],
  exports: [DropdownComponent, NgSelectModule, MultiItemBoxComponent, DpDatePickerModule, TableSorterComponent]
})
export class GUIModule { }
