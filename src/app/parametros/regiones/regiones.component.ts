import { Component, OnInit } from '@angular/core';
import { ParametrosService } from '../parametros.service';
import { Location } from '@angular/common';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-regiones',
  templateUrl: './regiones.component.html',
  styleUrls: ['./regiones.component.css']
})
export class RegionesComponent implements OnInit {

  regiones: Array<string>;

  constructor(private parametrosService: ParametrosService, private _location: Location,
              private toastService: ToastService) { }

  ngOnInit(): void {
    this.parametrosService.loadRegionesFromBackend();
    this.parametrosService.regiones$.subscribe((reg) => {
      this.regiones = reg;
    })
  }
  
  onBackClicked(){
    //this._location.back();
  }

  onGuardarClicked(){
    this.parametrosService.updateRegiones$(this.regiones)
        .subscribe(() => {
          this.toastService.success('Operación realizada con éxito');
          this.parametrosService.loadRegionesFromBackend();
          this.onBackClicked();
        });
  }

}
