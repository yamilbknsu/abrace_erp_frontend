import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown/dropdown.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MultiItemBoxComponent } from './multi-item-box/multi-item-box.component';
import {DpDatePickerModule} from 'ng2-date-picker';



@NgModule({
  declarations: [DropdownComponent, MultiItemBoxComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    DpDatePickerModule
  ],
  exports: [DropdownComponent, NgSelectModule, MultiItemBoxComponent, DpDatePickerModule]
})
export class GUIModule { }
