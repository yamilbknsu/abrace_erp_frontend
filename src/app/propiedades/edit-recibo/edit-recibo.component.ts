import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccionesService } from 'src/app/acciones/acciones.service';
import { ToastService } from 'src/app/services/toast.service';
import { PropiedadesService } from '../propiedades.service';

@Component({
  selector: 'app-edit-recibo',
  templateUrl: './edit-recibo.component.html',
  styleUrls: ['./edit-recibo.component.css']
})
export class EditReciboComponent implements OnInit {

  recibos: any[] = [];
  reciboSelected:any = {};
  editingId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  estados: any[] = [{name: 'Generado'}, {name: 'Emitido'}, {name: 'Cancelado'}]

  contratoId = '';
  datePickerConfig = {
    locale: 'es'
  }

  constructor(private propiedadesService: PropiedadesService, private route: ActivatedRoute,
              private toastService: ToastService, private accionesService : AccionesService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params =>
      { this.contratoId = params['contrato'];
        this.propiedadesService.loadRecibosContrato(params['contrato']).subscribe((a) => this.recibos = a.sort(this.accionesService.getSortByDate(true)))})

    this.editingId$.subscribe(id => {
      if(id == 'new'){
        this.reciboSelected = {
          fecha: moment(),
          tipo: 'Manual',
          estado: 'Generado',
          valorinicial: 0,
          valorfinal: 0,
          contrato: this.contratoId,
          userid: this.recibos[0].userid
        }
      }else{
        var filtered = this.recibos.filter(r => r._id == id);
        if(filtered?.length > 0){
          this.reciboSelected = {...filtered[0]};
          this.reciboSelected.fecha = moment(new Date(this.reciboSelected.fecha))
        }
        else this.reciboSelected = {};
      }
    });
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('/');
  }

  crearClicked(){
    this.editingId$.next('new');
  }

  selectRecibo(id){
    this.editingId$.next(id);
  }

  cancelar(){
    this.editingId$.next('');
  }

  guardar(){
    if(this.editingId$.value == 'new'){
      this.propiedadesService.writeBoleta(this.reciboSelected)
          .subscribe(() => {
            this.toastService.success('Operación realizada con éxito');
            this.propiedadesService.loadRecibosContrato(this.contratoId).subscribe((a) => this.recibos = a);
            this.cancelar();
          });
    }else{
      this.propiedadesService.updateBoleta(this.reciboSelected)
      .subscribe(() => {
        this.toastService.success('Operación realizada con éxito');
        this.propiedadesService.loadRecibosContrato(this.contratoId).subscribe((a) => this.recibos = a);
        this.cancelar();
      });
    }
  }
}
