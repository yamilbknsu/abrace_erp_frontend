import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { ParametrosService } from '../parametros.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-comunas',
  templateUrl: './comunas.component.html',
  styleUrls: ['./comunas.component.css']
})
export class ComunasComponent implements OnInit {
  comunas: Array<string>;

  constructor(private parametrosService: ParametrosService, private _location: Location,
              private toastService: ToastService) { }

  ngOnInit(): void {
    this.parametrosService.loadComunasFromBackend();
    this.parametrosService.comunas$.subscribe((reg) => {
      this.comunas = reg;
    })
  }
  
  onBackClicked(){
    //this._location.back();
  }

  onGuardarClicked(){
    this.parametrosService.updateComunas$(this.comunas)
        .subscribe(() => {
          this.toastService.success('Operación realizada con éxito');
          this.parametrosService.loadComunasFromBackend();
          this.onBackClicked();
        });
  }

}
