import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { Contrato } from '../models/Contrato';
import { Propiedad } from '../models/Propiedad';
import { ParametrosService } from '../parametros/parametros.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class PropiedadesService {

  propiedades$: BehaviorSubject < Propiedad[] > = new BehaviorSubject < Propiedad[] > ([]);
  contratos$: BehaviorSubject < Contrato[] > = new BehaviorSubject < Contrato[] > ([]);;

  constructor(private queryService: QueryService, private router: Router, private toastService: ToastService) {}

  getPropiedades$(): BehaviorSubject < Propiedad[] > {
    return this.propiedades$;
  }

  getPropiedad(id) {
    return this.getPropiedades$().pipe(
      map(propiedades => propiedades.find(prop => prop._id == id))
    );
  }

  updatePropiedad$(propiedad: Propiedad): Observable < any > {
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'propiedades', this.cleanPropiedad(propiedad), {
      id: propiedad._id
    }).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          this.toastService.error('No tienes permiso para realizar esta acción.')
        } else {
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
            message += (err.error.details ? err.error.details[0].message : err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }

  createPropiedad$(propiedad: Propiedad): Observable < any > {
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('write', 'propiedades', this.cleanPropiedad(propiedad), {}).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          this.toastService.error('No tienes permiso para realizar esta acción.')
        } else {
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
            message += (err.error.details ? err.error.details[0].message : err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }

  loadPropiedadesFromBackend() {
    // Get an Observable from the response of the backend
    this.queryService.executeGetQuery('read', 'propiedades', {}, {}).pipe(
        // Add DireccionStr
        map(data => this.joinPropiedadData(data)),

        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403) {
            console.log('Forbidden access');
            this.router.navigate([{
              outlets: {
                primary: 'login'
              }
            }], {
              queryParams: {
                expired: true
              }
            });
          };
          return EMPTY;
        })
      )
      // And subscribe to it
      .subscribe(res => this.propiedades$.next(res));
  }

  deletePropiedad$(id) {
    // Get an Observable from the response of the backend
    return this.queryService.executeDeleteQuery('delete', 'propiedades', {}, {
      id
    }).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          this.toastService.error('No tienes permiso para realizar esta acción.')
        } else {
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
            message += (err.error.details ? err.error.details[0].message : err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }


  joinPropiedadData(data) {
    data.map(prop => {
      var direccionStr = '';

      if (!prop.direccionData) prop.direccionData = {
        calle: 'Sin definir'
      };
      if (!prop.mandanteData) prop.mandanteData = {
        nombre: 'Sin definir',
        telefonos: [],
        emails: []
      };

      direccionStr = (prop.direccionData.calle != undefined ? prop.direccionData.calle : '') + ' ' +
        (prop.direccionData.numero != undefined ? prop.direccionData.numero : '') + ' ' +
        (prop.direccionData.depto != undefined ? '#' + prop.direccionData.depto : '') + ' ' +
        (prop.direccionData.comuna != undefined ? ', ' + prop.direccionData.comuna : '') + ' ' +
        (prop.direccionData.region != undefined ? ', ' + prop.direccionData.region : '')
      prop.direccionStr = direccionStr
  
      if (prop.lastcontrato && Object.keys(prop.lastcontrato).length !== 0 &&
        (prop.lastcontrato.fechatermino == undefined || moment(prop.lastcontrato.fechatermino).toDate() > new Date())) {
        prop.arrendatario = prop.lastcontrato.arrendatarioData.nombre
        prop.estados = ['Arrendada'];
      } else {
        prop.arrendatario = '-';
        prop.estados = ['Libre'];
      }
    });

    return data;
  }

  cleanPropiedad(propiedad) {
    const {
      direccionStr,
      arrendatario,
      estados,
      ...result
    } = propiedad;
    return result;
  }

  updateMandato$(mandato): Observable < any > {
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'mandatos', this.cleanMandato(mandato), {
      id: mandato._id
    }).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          this.toastService.error('No tienes permiso para realizar esta acción.')
        } else {
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
            message += (err.error.details ? err.error.details[0].message : err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }

  cleanMandato(mandato) {
    return mandato;
  }

  loadContratos(propiedadID) {
    // Get an Observable from the response of the backend
    return this.queryService.executeGetQuery('read', 'contratos', {}, {
      propiedad: propiedadID
    }).pipe(
      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          console.log('Forbidden access');
          this.router.navigate([{
            outlets: {
              primary: 'login'
            }
          }], {
            queryParams: {
              expired: true
            }
          });
        };
        return EMPTY;
      })
    )
    // And subscribe to it
    //.subscribe(res => {
    //  if(res && res?.length){
    //    this.contratos$.next(res.sort((a,b) => (new Date(a.fechacontrato) > new Date(b.fechacontrato)) ? -1 : 1))
    //  }
    //});
  }

  getContrato(id) {
    return this.contratos$.pipe(
      map(contratos => contratos.find(cont => cont._id == id))
    );
  }

  loadRecibosContrato(contratoID) {
    // Get an Observable from the response of the backend
    return this.queryService.executeGetQuery('read', 'boletas', {}, {
      contrato: contratoID
    }).pipe(
      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          console.log('Forbidden access');
          this.router.navigate([{
            outlets: {
              primary: 'login'
            }
          }], {
            queryParams: {
              expired: true
            }
          });
        };
        return EMPTY;
      })
    )
  }

  computeNextBoleta(contrato, lastBoleta) {
    var lastDate = new Date(lastBoleta.fecha);
    if (contrato.tiempoarriendo == 'Mensual') lastDate.setMonth(lastDate.getMonth() + 1);
    if (contrato.tiempoarriendo == 'Trimestral') lastDate.setMonth(lastDate.getMonth() + 3);
    if (contrato.tiempoarriendo == 'Semestral') lastDate.setMonth(lastDate.getMonth() + 6);
    if (contrato.tiempoarriendo == 'Anual') lastDate.setMonth(lastDate.getMonth() + 12);

    return {
      fecha: lastDate,
      contrato: contrato._id,
      userid: contrato.userid,
      valorinicial: lastBoleta.valorfinal,
      emitida: false,
      valorfinal: lastBoleta.valorfinal
    }
  }

  writeBoleta(boleta) {
    return this.queryService.executePostQuery('write', 'boletas', boleta, {})
      .pipe(
        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403) {
            console.log('Forbidden access');
            this.router.navigate([{
              outlets: {
                primary: 'login'
              }
            }], {
              queryParams: {
                expired: true
              }
            });
          };
          return EMPTY;
        })
      );
  }

  updateBoleta(boleta) {
    return this.queryService.executePostQuery('update', 'boletas', boleta, {id: boleta._id})
      .pipe(
        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403) {
            console.log('Forbidden access');
            this.router.navigate([{
              outlets: {
                primary: 'login'
              }
            }], {
              queryParams: {
                expired: true
              }
            });
          };
          return EMPTY;
        })
      );
  }

  updateContrato(contrato): Observable < any > {
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'contratos', this.cleanContrato(contrato), {
      id: contrato._id
    }).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          this.toastService.error('No tienes permiso para realizar esta acción.')
        } else {
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
            message += (err.error.details ? err.error.details[0].message : err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }

  createContrato(contrato): Observable < any > {
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('write', 'contratos', this.cleanContrato(contrato), {}).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          this.toastService.error('No tienes permiso para realizar esta acción.')
        } else {
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
            message += (err.error.details ? err.error.details[0].message : err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }

  closeContrato(id, fecha) {
    // Get an Observable from the response of the backend
    return this.queryService.executePostQuery('update', 'closecontrato', {}, {
      id,
      fechatermino: fecha
    }).pipe(

      // Catch a Forbidden acces error (return to login).
      catchError(err => {
        if (err.status == 403) {
          this.toastService.error('No tienes permiso para realizar esta acción.')
        } else {
          console.log(err)
          var message = err.status + ' ';
          if (err.error)
            message += (err.error.details ? err.error.details[0].message : err.error);
          this.toastService.error('Error desconocido. ' + message)

        }
        return EMPTY;
      })
    )
  }

  cleanContrato(contrato) {
    contrato.canoninicial = contrato.canoninicial.toString();
    contrato.canonactual = contrato.canonactual.toString();
    return contrato
  }

  deleteContrato(id) {
    return this.queryService.executeDeleteQuery('delete', 'contratos', {}, {
        id
      })
      .pipe(
        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403) {
            this.toastService.error('No tienes permiso para realizar esta acción.')
          } else {
            console.log(err)
            var message = err.status + ' ';
            if (err.error)
              message += (err.error.details ? err.error.details[0].message : err.error);
            this.toastService.error('Error desconocido. ' + message)

          }
          return EMPTY;
        })
      )
  }

  deleteBoletas(contratoid) {
    return this.queryService.executeDeleteQuery('delete', 'boletas', {}, {
        contratoid
      })
      .pipe(
        // Catch a Forbidden acces error (return to login).
        catchError(err => {
          if (err.status == 403) {
            this.toastService.error('No tienes permiso para realizar esta acción.')
          } else {
            console.log(err)
            var message = err.status + ' ';
            if (err.error)
              message += (err.error.details ? err.error.details[0].message : err.error);
            this.toastService.error('Error desconocido. ' + message)

          }
          return EMPTY;
        })
      )
  }

  writeDireccionStr(prop) {

    var direccionStr = '';

    if (!prop.direccionData) prop.direccionData = {
      calle: 'Sin definir'
    };
    direccionStr = (prop.direccionData.calle != undefined ? prop.direccionData.calle : '') + ' ' +
      (prop.direccionData.numero != undefined ? prop.direccionData.numero : '') + ' ' +
      (prop.direccionData.depto != undefined ? '#' + prop.direccionData.depto : '') + ' ' +
      (prop.direccionData.comuna != undefined ? ', ' + prop.direccionData.comuna : '') + ' ' +
      (prop.direccionData.region != undefined ? ', ' + prop.direccionData.region : '')
    prop.direccionStr = direccionStr

    return prop;
  }

  calcularReajuste(fechainicial, n_meses, ipc){
    //var ipc_acumulado = 1;

    //for(let i = 0; i < n_meses; i++){
    //  var fecha = moment(fechainicial).add(-(i+1), 'M');
    //  ipc_acumulado *= 1 + Number.parseFloat(ipc.filter(e => e.code == fecha.year().toString())[0]?.attributes[fecha.month()])/100;
    //}
    //return ipc_acumulado ?  (ipc_acumulado - 1) * 100 : 0;

    var fecha = moment(fechainicial).add(-(n_meses+1), 'M');
    var ipc_inicial = Number.parseFloat(ipc.filter(e => e.code == fecha.year().toString())[0]?.attributes[fecha.month()])

    fecha = moment(fechainicial).add(-1, 'M');
    var ipc_final = Number.parseFloat(ipc.filter(e => e.code == fecha.year().toString())[0]?.attributes[fecha.month()])
    console.log(ipc_final, ipc_inicial, ipc_final / ipc_inicial)
    return ipc_inicial && ipc_final ?  (ipc_final / ipc_inicial - 1) * 100 : 0;
  }

  cerrarMes(fecha, recibos, reajustes){
    return this.queryService.executePostQuery('write', 'cierresmes', {recibos, reajustes}, {fecha});
  }

}
