import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QueryService } from '../services/query.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AccionesService {

  sortDate = (a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? -1 : 1;
  sortDateReverse = (a, b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? 1 : -1;

  constructor(private queryService: QueryService, private toastService: ToastService, private router: Router) {
  }
  
  loadCierresMes(params={}){
    return this.queryService.executeGetQuery('read', 'cierresmes', {}, params);
  }

  loadContratosCierre(date){
    return this.queryService.executeGetQuery('read', 'contratoscierre', {}, {fecha: date});
  }

  loadPropiedadesPago(params={}){
    return this.queryService.executeGetQuery('read', 'pagopropiedades', {}, params);
  }

  writePago(pago){
    return this.queryService.executePostQuery('write', 'pagos', pago, {});
  }

  loadPagosInforme(params={}){
    return this.queryService.executeGetQuery('read', 'infpago', {}, params);
  }

  loadLiquidaciones(params={}){
    return this.queryService.executeGetQuery('read', 'liquidaciones', {}, params);
  }

  loadBoletasLiquidaciones(propiedad, fecha){
    return this.queryService.executeGetQuery('read', 'boletasliquidacion', {}, {propiedad, fecha});
  }

  writeLiquidacion(liquidacion){
    return this.queryService.executePostQuery('write', 'liquidaciones', liquidacion, {});
  }

  loadLiquidacionesInforme(params={}){
    return this.queryService.executeGetQuery('read', 'infliquidacion', {}, params);
  }

  sortByDate(a,b, reverse=false){
    if(reverse)
      return new Date(a.fecha) > new Date(b.fecha) ? -1 : 1;

    return new Date(a.fecha) > new Date(b.fecha) ? 1 : -1;
  }

  getSortByDate(reverse=false){
    if(reverse)
      return (a,b) => new Date(a.fecha) > new Date(b.fecha) ? -1 : 1;

    return (a,b) => new Date(a.fecha) > new Date(b.fecha) ? 1 : -1;
  }

  loadIngresos(propiedadId){
    return this.queryService.executeGetQuery('read', 'ingresos', {}, {propiedad: propiedadId});
  }

  loadEgresos(propiedadId){
    return this.queryService.executeGetQuery('read', 'egresos', {}, {propiedad: propiedadId});
  }

  writeEgreso(egreso){
    return this.queryService.executePostQuery('write', 'egresos', egreso,{});
  }

  writeIngreso(ingreso){
    return this.queryService.executePostQuery('write', 'ingresos', ingreso, {});
  }

  loadReajusteRentas(params={}){
    return this.queryService.executeGetQuery('read', 'reajusterentas', {}, params);
  }

  loadReajustesExtraordinarios(params={}){
    return this.queryService.executeGetQuery('read', 'reajustesextraordinarios', {}, params);
  }

  writeReajustesExtraordinarios(reajuste){
    return this.queryService.executePostQuery('write', 'reajustesextraordinarios', reajuste, {});
  }

  loadFechasLiqPagos(params={}){
    return this.queryService.executeGetQuery('read', 'fechasliqpagos', {}, params);
  }

  deleteReajustesExtraordinarios(id) {
    // Get an Observable from the response of the backend
    return this.queryService.executeDeleteQuery('delete', 'reajustesextraordinarios', {}, {
      id
    })
  }

  loadEstadoPagos(params={}){
    return this.queryService.executeGetQuery('read', 'estadopagos', {}, params);
  }

}
