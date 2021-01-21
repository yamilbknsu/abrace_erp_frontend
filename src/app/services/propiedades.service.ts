import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { QueryService } from 'src/app/services/query.service';

@Injectable({
  providedIn: 'root'
})
export class PropiedadesService {

  propiedades;

  constructor(private queryService: QueryService, private router: Router) { }

  loadFromBackend(){
    this.queryService.executeGetQuery('read', 'propiedades', {}, {})
    .subscribe(res =>{
      this.propiedades = res;
      this.joinPropiedadData();
    }, err => {
      if (err.status == 403){
        console.log('Forbidden access');
        this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
      };
      console.log(err.error.message);
    });
  }

  getPropiedades(){
    return this.propiedades;
  }

  loadAndGetPropiedades(){
    return new Observable(observer => {
      this.queryService.executeGetQuery('read', 'propiedades', {}, {})
      .subscribe(res =>{
        this.propiedades = res;
        this.joinPropiedadData();
        observer.next(this.propiedades);
      }, err => {
        if (err.status == 403){
          console.log('Forbidden access');
          this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: true } });
        };
        console.log(err.error.message);
      });
    });
  }

  joinPropiedadData(){
    this.propiedades.map(prop =>{
      var direccionStr = '';
      direccionStr = (prop.direccionData.calle != undefined ? prop.direccionData.calle:'') + ' ' +
                     (prop.direccionData.numero != undefined ? prop.direccionData.numero:'') + ' ' +
                     (prop.direccionData.depto != undefined ? '#' + prop.direccionData.depto:'') + ' ' +
                     (prop.direccionData.comuna != undefined ? ', ' + prop.direccionData.comuna:'') + ' ' +
                     (prop.direccionData.region != undefined ? ', ' + prop.direccionData.region:'')
                     prop.direccionStr = direccionStr
      
      if (Object.keys(prop.lastcontrato).length !== 0 &&
          (prop.lastcontrato.fechatermino == undefined || prop.lastcontrato.fechatermino > new Date())){
        prop.arrendatario = prop.lastcontrato.arrendatarioData.nombre
      }else{
        prop.arrendatario = '-'
      }
    });
  }

}


