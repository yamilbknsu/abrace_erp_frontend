import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {

  @Input() labelKey = 'label';
  @Input() idKey = 'id';
  @Input() options = [];
  
  @Input() model;

  originalOptions;

  constructor() { }

  ngOnInit(): void {
    this.originalOptions = [...this.options];
    if (this.model !== undefined) {
      this.model = this.options.find(
        currentOption => currentOption[this.idKey] === this.model
      );
    }
  }

  get label() {
    return this.model ? this.model[this.labelKey] : 'Select...';
  }

}
