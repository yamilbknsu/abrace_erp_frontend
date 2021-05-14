import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { AccionesService } from '../acciones/acciones.service';
import { PropiedadesService } from '../propiedades/propiedades.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingIconService {

  isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  warning_cierremes: BehaviorSubject<any> = new BehaviorSubject<any>({});
  warning_reajustes:BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(private propiedadesService: PropiedadesService, private accionesService: AccionesService) { }

  getLoadingFlag(){
    return this.isLoading;
  }

  checkCierresMes(){
    this.accionesService.loadCierresMes({fecha: moment().toDate()})
        .subscribe(data => {
          if(moment(data[0].fecha).diff(moment(), 'months') <= -2){
            this.warning_cierremes.next({message: 'Falta aplicar el cierre de mes ' + 
                      moment().locale('es').startOf('month').add(-1, 'month').format('MMM YYYY')})
            return;
          }

          this.warning_cierremes.next(undefined);
        })
  }

  checkReajustes(){
    this.accionesService.loadReajusteRentas({fecha: moment().toDate()})
        .subscribe(data => {
          if(moment(data[0].fecha).diff(moment(), 'months') <= -1){
            this.warning_reajustes.next({message: 'Falta aplicar los reajustes de ' + 
                      moment().locale('es').startOf('month').add(-1, 'month').format('MMM YYYY')})
            return;
          }

          this.warning_reajustes.next(undefined);
        })
  }
}
