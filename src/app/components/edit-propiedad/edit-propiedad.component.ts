import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-propiedad',
  templateUrl: './edit-propiedad.component.html',
  styleUrls: ['./edit-propiedad.component.css']
})
export class EditPropiedadComponent implements OnInit {

  @Input() propiedad;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    console.log(this.propiedad);
  }

}
