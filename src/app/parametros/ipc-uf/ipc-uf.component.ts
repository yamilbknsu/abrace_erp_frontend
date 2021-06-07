import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ToastService } from 'src/app/services/toast.service';
import { ParametrosService } from '../parametros.service';

@Component({
  selector: 'app-ipc-uf',
  templateUrl: './ipc-uf.component.html',
  styleUrls: ['./ipc-uf.component.css']
})
export class IpcUfComponent implements OnInit {

  fechaIPC: string;
  fechaUF;
  ipcData;
  ipcArray:any = [...Array(12).keys()].map(e => '');
  ufData;
  ufArray:any = [...Array(31).keys()].map(e => '');

  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo',
                     'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre',
                     'Noviembre', 'Diciembre'];
  dias: number[] = [...Array(32).keys()].slice(1,32);
  
  datePickerConfig = {
    locale: 'es'
  }

  constructor(private parametrosService: ParametrosService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.fechaIPC = moment().year().toString();
    this.fechaUF = moment().startOf('month');
    this.cargarIPC();
    //this.fechaUFChange();
  }

  fechaUFChange(){
    this.parametrosService.loadUFFromBackend()
        .subscribe((data) => {
          this.ufData = data[0];
          var filtered_data = data[0].values.filter(v => moment(v.code).isSame(this.fechaUF));
          if(filtered_data.length == 0){
            this.ufData.values.push({code: this.fechaUF, attributes: [...Array(31).keys()].fill(0)})
          }
          this.ufArray = this.ufData.values.filter(v => moment(v.code).isSame(this.fechaUF))[0].attributes;
        });
  }

  cargarIPC(){
    this.parametrosService.loadIPCFromBackend()
        .subscribe((data) => {
          this.ipcData = data[0];
          var filtered_data = data[0].values.filter(v => v.code == this.fechaIPC);
          if(filtered_data.length == 0){
            this.ipcData.values.push({code: this.fechaIPC, attributes: [...Array(12).keys()].fill(0)})
          }
          this.ipcArray = this.ipcData.values.filter(v => v.code == this.fechaIPC)[0].attributes;
        });
  }

  guardarIPC(){
    if(!this.ipcData) return;

    this.ipcArray = this.ipcArray.map(v => {
      var number = Number.parseFloat((v + '').trim().replaceAll(',', '.'));
      return !number ? 0 : number
    });
    
    let index = this.ipcData.values.map(e => e.code == this.fechaIPC ? 1 : 0).indexOf(1);
    this.ipcData.values[index].attributes = this.ipcArray;

    
    this.parametrosService.saveIPCToBackend(this.ipcData)
        .subscribe(data => {
          this.toastService.success('Operación realizada con éxito');
        });
  }

  guardarUF(){
    if(!this.ufData) return;

    this.ufArray = this.ufArray.map(v => {
      var number:any = Number.parseFloat((v + '').trim().replaceAll(',', '.'));
      return !number ? 0 : number
    });

    let index = this.ufData.values.map(e => moment(e.code).isSame(this.fechaUF) ? 1 : 0).indexOf(1);
    this.ufData.values[index].attributes = this.ufArray;

    this.parametrosService.saveUFToBackend(this.ufData)
        .subscribe(data => {
          this.toastService.success('Operación realizada con éxito');
        });
  }

  padDay(n){
    return n < 10 ? '0' + n : n + '';
  }
}
