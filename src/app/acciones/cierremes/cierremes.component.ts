import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { LoadingIconService } from 'src/app/services/loading-icon.service';
import { ToastService } from 'src/app/services/toast.service';
import { AccionesService } from '../acciones.service';

@Component({
  selector: 'app-cierremes',
  templateUrl: './cierremes.component.html',
  styleUrls: ['./cierremes.component.css']
})
export class CierremesComponent implements OnInit {

  datePickerConfig = {
    locale: 'es'
  }

  fecha;
  reajusteExists: boolean = false;
  cierreListo = false;
  cargandoReajustes = false;
  //reajustePreparado = false;
  reajustes: any[] = [];
  cierres: any[] = [];

  boletasUpload: any[] = [];
  reajustesUpload: any[] = [];

  ipc = [];

  constructor(private route: ActivatedRoute, private propiedadesService: PropiedadesService,
              private accionesService: AccionesService, private parametrosService: ParametrosService,
              private toastService: ToastService, private loadingIconService: LoadingIconService) { }

  ngOnInit(): void {
    this.fecha = moment().locale('es').startOf('month');

    //this.route.data.subscribe(data => {
    //});
    this.ipc = [{}]
    //this.parametrosService.loadIPCFromBackend()
    //    .subscribe(ipc => {if(ipc.values.length == 0) this.ipc = ipc[0].values});
  }

  fechaChange(){
    if(!this.fecha) this.fecha = moment().locale('es').startOf('month');

    this.reajusteExists = false;
    this.cierreListo = false
    this.reajustes = [];
    this.boletasUpload = [];
    //this.reajustePreparado = false;
    if(!this.cargandoReajustes){
      this.cargandoReajustes = true;
      //console.log(this.fecha.toDate());
      this.accionesService.loadCierresMes({fecha: this.fecha.toDate()})
      .subscribe(data => {
        //console.log(data);
        this.cargandoReajustes = false;

        data.map(cierre => {
          if(cierre.boletas.length == 1 && !cierre.boletas[0]._id) cierre.boletas = [];
          if(cierre.reajustes.length == 1 && !cierre.reajustes[0]._id) cierre.reajustes = [];
          return cierre
        });
        this.cierres = data;

        if(data.length >= 1){
          const corresponde = moment(data[0].fecha).startOf('month').add(1, 'M').toDate();
          if(moment(this.fecha).diff(data[0].fecha, 'months') > 1){
            this.toastService.warning('Falta cerrar el periodo ' + corresponde.toLocaleString('es', {month: 'long'}) + 
            ' ' + corresponde.getUTCFullYear());
          }

          if(moment(this.fecha).diff(data[0].fecha, 'months') < 0){
            this.toastService.warning('Ya se cerró el periodo ' + (new Date(data[0].fecha)).toLocaleString('es', {month: 'long'}) + 
            ' ' + (new Date(data[0].fecha)).getUTCFullYear());
          }
        }

        var cierresFecha = this.cierres.filter(c => {
          return new Date(c.fecha).getTime() == new Date(this.fecha).getTime()
        });
    
        this.boletasUpload = [];
        this.reajustesUpload = [];
    
        this.reajusteExists = cierresFecha.length > 0;
        this.reajustes = this.reajusteExists ? cierresFecha[0].reajustes.concat(cierresFecha[0].boletas).sort((a,b) => new Date(a.fecha) > new Date(b.fecha) ? 1 : -1) : [];
      });
    }
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

  formatDireccion(propiedad){
    return this.propiedadesService.writeDireccionStr(propiedad).direccionStr;
  }

  formatDecimal(number){
    return Math.round(number*100)/100;
  }

  OnPrepararClick(){
    this.boletasUpload = [];
    this.reajustesUpload = [];
    this.reajustes = [];
    this.cierreListo = false

    this.accionesService.loadContratosCierre(this.fecha.endOf('month').toDate())
        .subscribe((data) => {
          if(data?.length > 0){
            console.log(data)
            data.forEach(element => {

              // Calculos de recibo
              var last_boleta = element.boletas.filter(b => b.tipo == 'Automatico' || b.tipo == 'Inicial')
                     .sort((a,b) => new Date(b.fecha) > new Date(a.fecha) ? 1 : -1)[0]
              
              
              const reajuste_diff = this.fecha.startOf('month').diff(moment(element.contrato.proximoreajuste).startOf('month'), 'months');   
              const arriendo_diff = this.fecha.startOf('month').diff(moment(last_boleta.fecha).startOf('month'), 'months');
              //if(element.propiedad.uId == 'P01') console.log(reajuste_diff)
              var reajuste_interval = 1;
              if(element.contrato.tiemporeajuste == 'Mensual') reajuste_interval = 1;
              else if(element.contrato.tiemporeajuste == 'Trimestral') reajuste_interval = 3;
              else if(element.contrato.tiemporeajuste == 'Semestral') reajuste_interval = 6;
              else if(element.contrato.tiemporeajuste == 'Anual') reajuste_interval = 12;

              //var valor_reajuste = Math.round(this.propiedadesService.calcularReajuste(this.fecha, reajuste_interval, this.ipc) * 1000000) / 1000000
              var valor_final_reajuste = 0;

              //if(reajuste_diff >= 0){
              //  valor_final_reajuste = Math.round(element.contrato.canonactual * (1 + valor_reajuste / 100));

              //  this.reajustesUpload.push({
              //    contrato: element.contrato._id,
              //    userid: element.contrato.userid,
              //    fecha: moment(last_boleta.fecha).add(arriendo_diff, 'M').toDate(),
              //    valorinicial: element.contrato.canonactual,
              //    valorfinal: Math.round(element.contrato.canonactual * (1 + valor_reajuste / 100)),
              //    reajuste: valor_reajuste
              //  });

              //  this.reajustes.push({
              //      contrato: element.contrato,
              //      userid: element.contrato.userid,
              //      fecha: moment(last_boleta.fecha).add(arriendo_diff, 'M').toDate(),
              //      valorinicial: element.contrato.canonactual,
              //      valorfinal: Math.round(element.contrato.canonactual * (1 + valor_reajuste / 100)),
              //      propiedadData: element.propiedad,
              //      reajuste: valor_reajuste
              //    })
              //}else{
              valor_final_reajuste = element.contrato.canonactual;
              //}
              

              var arriendo_interval = 1;
              if(element.contrato.tiempoarriendo == 'Mensual') arriendo_interval = 1;
              else if(element.contrato.tiempoarriendo == 'Trimestral') arriendo_interval = 3;
              else if(element.contrato.tiempoarriendo == 'Semestral') arriendo_interval = 6;
              else if(element.contrato.tiempoarriendo == 'Anual') arriendo_interval = 12;

              if(arriendo_diff >= arriendo_interval && element.contrato.moneda == 'CLP'){
                this.boletasUpload.push({
                  contrato: element.contrato._id,
                  userid: element.contrato.userid,
                  fecha: moment(last_boleta.fecha).add(arriendo_diff, 'M').toDate(),
                  valorinicial: last_boleta.valorfinal,
                  valorfinal: valor_final_reajuste,
                  estado: "Generado",
                  tipo: "Automatico"
                });

                this.reajustes.push({
                    contrato: element.contrato,
                    userid: element.contrato.userid,
                    fecha: moment(last_boleta.fecha).add(arriendo_diff, 'M').toDate(),
                    valorinicial: last_boleta.valorfinal,
                    valorfinal: valor_final_reajuste,
                    propiedadData: element.propiedad,
                    estado: "Generado",
                    tipo: "Automatico"
                  })
              }

            });

            this.reajustes = this.reajustes.filter(e => e.reajuste?.toString()).sort((a,b) => new Date(a.fecha) > new Date(b.fecha) ? 1 : -1)
                             .concat(this.reajustes.filter(e => !e.reajuste?.toString()).sort((a,b) => new Date(a.fecha) > new Date(b.fecha) ? 1 : -1));
            this.cierreListo = true;
          }
        });
  }

  aplicar(){
    if(this.boletasUpload){
      this.propiedadesService.cerrarMes(this.fecha.toDate(), this.boletasUpload, this.reajustesUpload)
                .subscribe((data) => {
                    this.accionesService.loadCierresMes({fecha: this.fecha.toDate()})
                        .subscribe(data_ => {
                          data_.map(cierre => {
                            if(cierre.boletas.length == 1 && !cierre.boletas[0]._id) cierre.boletas = [];
                            if(cierre.reajustes.length == 1 && !cierre.reajustes[0]._id) cierre.reajustes = [];
                            return cierre
                          });
                          
                          this.cierres = data_;
                          this.fechaChange();
                          this.toastService.success('Operación realizada con éxito');
                          this.loadingIconService.checkCierresMes();
                        })
                });
    }
  }

  getPeriodo(fecha){
    return ((new Date(fecha)).getMonth() + 1) + '/' + ((new Date(fecha)).getFullYear())
  }
}
