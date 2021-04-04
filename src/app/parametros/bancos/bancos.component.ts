import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/services/toast.service';
import { ParametrosService } from '../parametros.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.css']
})
export class BancosComponent implements OnInit {

  bancos: Array<string>;

  constructor(private parametrosService: ParametrosService, private _location: Location,
              private toastService: ToastService) { }

  ngOnInit(): void {
    this.parametrosService.loadBancosFromBackend();
    this.parametrosService.bancos$.subscribe((reg) => {
      this.bancos = reg;
    })
  }
  
  onBackClicked(){
    //this._location.back();
  }

  onGuardarClicked(){
    this.parametrosService.updateBancos$(this.bancos)
        .subscribe(() => {
          this.toastService.success('Operación realizada con éxito');
          this.parametrosService.loadRegionesFromBackend();
          this.onBackClicked();
        });
  }
}
