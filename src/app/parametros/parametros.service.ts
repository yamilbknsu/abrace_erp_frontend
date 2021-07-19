import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Parametro } from '../models/Parametro';
import { idPropiedadPipe } from '../propiedades/propiedad-id-filter.pipe';
import { QueryService } from '../services/query.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  regiones$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  regionesObject$: BehaviorSubject<Parametro> = new BehaviorSubject<Parametro>(new Parametro());

  comunas$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  comunasObject$: BehaviorSubject<Parametro> = new BehaviorSubject<Parametro>(new Parametro());

  bancos$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  bancosObject$: BehaviorSubject<Parametro> = new BehaviorSubject<Parametro>(new Parametro());

  formasPago$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  funcionComision$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  estadoContrato$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  tipoContrato$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  plazos$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  monedas$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);

  constructor(private queryService: QueryService, private router: Router,
              private toastService: ToastService) { }

  loadParametroFromBackend(concept){
    // Get an Observable from the response of the backend and subscribe to it
    return this.queryService.executeGetQuery('read', 'parametros', {}, {concept})
    
  }

  loadFormasPagoFromBackend(){
    this.loadParametroFromBackend("formaspago").subscribe(res => {
      this.formasPago$.next(res[0].values[0].attributes.sort())
    });
  }

  loadFormasFuncionComisionFromBackend(){
    this.loadParametroFromBackend("funcioncomision").subscribe(res => {
      this.funcionComision$.next(res[0].values[0].attributes.sort())
    });
  }

  loadTipoContratoFromBackend(){
    this.loadParametroFromBackend("tipocontrato").subscribe(res => {
      this.tipoContrato$.next(res[0].values[0].attributes.sort())
    });
  }

  loadEstadoContratoFromBackend(){
    this.loadParametroFromBackend("estadocontrato").subscribe(res => {
      this.estadoContrato$.next(res[0].values[0].attributes.sort())
    });
  }

  loadPlazosFromBackend(){
    this.loadParametroFromBackend("plazos").subscribe(res => {
      this.plazos$.next(res[0].values[0].attributes.sort())
    });
  }

  loadMonedasFromBackend(){
    this.loadParametroFromBackend("monedas").subscribe(res => {
      this.monedas$.next(res[0].values[0].attributes.sort())
    });
  }
  
  loadRegionesFromBackend(){
    this.loadParametroFromBackend("regiones").subscribe(res => {
      this.regionesObject$.next(res[0]);
      this.regiones$.next(res[0].values[0].attributes
                                .map(value => ({name:value, num: this.romanToNum(value.split(' ')[0])}))
                                .sort((a,b) => a.num-b.num)
                                .map(value => value.name))
    });
  }

  loadComunasFromBackend(){
    this.loadParametroFromBackend("comunas").subscribe(res => {
      this.comunasObject$.next(res[0]);
      this.comunas$.next(res[0].values[0].attributes.sort())
    });
  }

  loadBancosFromBackend(){
    this.loadParametroFromBackend("bancos").subscribe(res => {
      this.bancosObject$.next(res[0]);
      this.bancos$.next(res[0].values[0].attributes.sort())
    });
  }

  loadIPCFromBackend(){
    // Get an Observable from the response of the backend and subscribe to it
    return this.queryService.executeGetQuery('read', 'userparam', {}, {concept: 'ipc'})
  }

  saveIPCToBackend(ipc){
    // Get an Observable from the response of the backend and subscribe to it
    return this.queryService.executePostQuery('update', 'userparam', ipc, {id: ipc._id})
  }

  loadUFFromBackend(){
    // Get an Observable from the response of the backend and subscribe to it
    return this.queryService.executeGetQuery('read', 'userparam', {}, {concept: 'uf'})
  }

  saveUFToBackend(uf){
    // Get an Observable from the response of the backend and subscribe to it
    return this.queryService.executePostQuery('update', 'userparam', uf, {id: uf._id})
  }


  updateRegiones$(regiones: Array<string>){//: Observable<any>{
    var regionesObjectCopy = {... this.regionesObject$.value};
    regionesObjectCopy.values[0].attributes = regiones;

    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'parametros', regionesObjectCopy, {concept: 'regiones'})
  }

  updateComunas$(comunas: Array<string>){//: Observable<any>{
    var comunasObjectCopy = {... this.comunasObject$.value};
    comunasObjectCopy.values[0].attributes = comunas;

    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'parametros', comunasObjectCopy, {concept: 'comunas'})
  }

  updateBancos$(bancos: Array<string>){//: Observable<any>{
    var bancosObjectCopy = {... this.bancosObject$.value};
    bancosObjectCopy.values[0].attributes = bancos;

    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'parametros', bancosObjectCopy, {concept: 'bancos'})
  }


  
  romanToNum(roman) {
    if (roman === "" || roman === 'RM')           return 0;
    if (roman.startsWith("L"))  return 50 + this.romanToNum(roman.substr(1));
    if (roman.startsWith("XL")) return 40 + this.romanToNum(roman.substr(2));
    if (roman.startsWith("X"))  return 10 + this.romanToNum(roman.substr(1));
    if (roman.startsWith("IX")) return 9  + this.romanToNum(roman.substr(2));
    if (roman.startsWith("V"))  return 5  + this.romanToNum(roman.substr(1));
    if (roman.startsWith("IV")) return 4  + this.romanToNum(roman.substr(2));
    if (roman.startsWith("I"))  return 1  + this.romanToNum(roman.substr(1));
    return 0;
  }
}
