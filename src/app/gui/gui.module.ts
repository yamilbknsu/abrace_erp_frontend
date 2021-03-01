import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown/dropdown.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MultiItemBoxComponent } from './multi-item-box/multi-item-box.component';



@NgModule({
  declarations: [DropdownComponent, MultiItemBoxComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  exports: [DropdownComponent, NgSelectModule, MultiItemBoxComponent]
})
export class GUIModule { }
