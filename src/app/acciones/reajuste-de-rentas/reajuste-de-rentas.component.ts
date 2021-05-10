import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { ToastService } from 'src/app/services/toast.service';
import { AccionesService } from '../acciones.service';

@Component({
  selector: 'app-reajuste-de-rentas',
  templateUrl: './reajuste-de-rentas.component.html',
  styleUrls: ['./reajuste-de-rentas.component.css']
})
export class ReajusteDeRentasComponent implements OnInit {

  periodoReajustar;
  reajustes = [];
  reajustesUpload = [];
  reajustesExtraordinarios = [];
  reajusteExists: boolean = false;

  cargandoReajustes = false;
  reajustePreparado = false;

  datePickerConfig = {
    locale: 'es'
  }

  ipc = [];
  ipc_ultimo = [];
  meses: string[] = ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'Mayo',
                     'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.',
                     'Nov.', 'Dic.'];

  constructor(private accionesService: AccionesService, private toastService: ToastService,
              private propiedadesService: PropiedadesService, private parametrosService: ParametrosService) { }

  ngOnInit(): void {
    this.periodoReajustar = moment().locale('es').startOf('month');

    this.parametrosService.loadIPCFromBackend()
        .subscribe(ipc => {console.log(ipc); this.ipc = ipc[0].values});
  }

  changePeriodo(){
    if(!this.periodoReajustar) this.periodoReajustar = moment().locale('es').startOf('month');

    this.ipc_ultimo = [];

    this.reajusteExists = false;
    this.reajustes = [];
    this.reajustesExtraordinarios = [];
    this.reajustesUpload = [];
    this.reajustePreparado = false;

    if(!this.cargandoReajustes){
      this.cargandoReajustes = true;

      this.accionesService.loadReajusteRentas({fecha: this.periodoReajustar.toDate()})
          .subscribe(data => {
            //console.log(data);
            //console.log(moment(data[0].fecha).startOf('month').diff([2021, 1, 1], 'months'))
            this.cargandoReajustes = false;

            if(data.length >= 1){
              const monthDiff = moment(data[0].fecha).startOf('month').diff(this.periodoReajustar, 'months');
              const corresponde = moment(data[0].fecha).startOf('month').add(1, 'M').toDate();
              if(monthDiff < -1 || monthDiff > 0)
                this.toastService.warning('Falta reajustar el periodo ' + corresponde.toLocaleString('es', {month: 'long'}) + 
                  ' ' + corresponde.getUTCFullYear());

              if(monthDiff == 0){
                this.reajusteExists = true;
                this.reajustes = data[0].reajustes;
              }
            }
          });
    }
  }

  OnPrepararClick(){
    if(this.ipc.length > 0) {
      this.ipc_ultimo = [...Array(13).keys()].map(value => {
        //console.log(value, moment(this.periodoReajustar).add(-value,'M').toDate())
        var fecha_mes = moment(this.periodoReajustar).add(-(12 - value + 1), 'M');
        const valor = Number.parseFloat(this.ipc.filter(e => e.code == fecha_mes.year().toString())[0]?.attributes[fecha_mes.month()])
        return ({mes: this.meses[fecha_mes.month()] + ' ' + fecha_mes.year(), valor: valor ? valor : '0'})
      });
    }

    this.reajustesUpload = [];
    this.reajustePreparado = true;

    this.accionesService.loadReajustesExtraordinarios({fecha: this.periodoReajustar.toDate()})
        .subscribe(data => this.reajustesExtraordinarios = data)

    this.accionesService.loadContratosCierre(this.periodoReajustar.endOf('month').toDate())
        .subscribe(data => {
          if(data?.length == 0) return;

          data.forEach(element => {
            var last_boleta = element.boletas[0];

            const reajuste_diff = this.periodoReajustar.startOf('month').diff(moment(element.contrato.proximoreajuste).startOf('month'), 'months'); 

            var reajuste_interval = 1;
            if(element.contrato.tiemporeajuste == 'Mensual') reajuste_interval = 1;
            else if(element.contrato.tiemporeajuste == 'Trimestral') reajuste_interval = 3;
            else if(element.contrato.tiemporeajuste == 'Semestral') reajuste_interval = 6;
            else if(element.contrato.tiemporeajuste == 'Anual') reajuste_interval = 12;

            var valor_reajuste = Math.round(this.propiedadesService.calcularReajuste(this.periodoReajustar, reajuste_interval, this.ipc) * 1000000) / 1000000
            var valor_final_reajuste = 0;

            if(reajuste_diff >= 0){
              valor_final_reajuste = Math.round(element.contrato.canonactual * (1 + valor_reajuste / 100));

              this.reajustesUpload.push({
                contrato: element.contrato._id,
                userid: element.contrato.userid,
                fecha: this.periodoReajustar.toDate(),
                valorinicial: element.contrato.canonactual,
                valorfinal: Math.round(element.contrato.canonactual * (1 + valor_reajuste / 100)),
                reajuste: valor_reajuste,
                tipo: 'Automatico'
              });

              this.reajustes.push({
                  contrato: element.contrato._id,
                  userid: element.contrato.userid,
                  fecha: this.periodoReajustar.toDate(),
                  valorinicial: element.contrato.canonactual,
                  valorfinal: Math.round(element.contrato.canonactual * (1 + valor_reajuste / 100)),
                  propiedadData: element.propiedad,
                  reajuste: valor_reajuste,
                  tiempo: element.contrato.tiemporeajuste,
                  aplicar: true
                })
            }else{
              valor_final_reajuste = element.contrato.canonactual;
            }
          });
        });
  }

  aplicar(){
    //if(this.reajustesUpload.length > 0){
      this.propiedadesService.reajustesMes(this.periodoReajustar.toDate(), {reajustes: this.reajustesUpload.map(reajuste => {
        if(!this.reajustes.filter(r => r.contrato == reajuste.contrato)[0].aplicar){
          reajuste.reajuste = 0;
          reajuste.valorfinal = reajuste.valorinicial;
        }
        return reajuste;
      }),
      reajustesExtraordinarios: this.reajustesExtraordinarios.map(reajuste => {

        return ({
          contrato: reajuste.contrato,
          userid: reajuste.userid,
          fecha: this.periodoReajustar.toDate(),
          valorinicial: reajuste.valorinicial,
          valorfinal: reajuste.valorfinal,
          reajuste: reajuste.reajuste,
          tipo: 'Extraordinario'
        })
      })})
      .subscribe((data) => {
        this.changePeriodo();
        this.toastService.success('Operación realizada con éxito');
      } /*{
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
              })
      }*/);
    //}
  }

  changeReajusteAplicar(i){
    this.reajustes[i].aplicar = !this.reajustes[i].aplicar;
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

    return [month, year].join('/');
  }

  formatDireccion(propiedad){
    return this.propiedadesService.writeDireccionStr(propiedad).direccionStr;
  }

  formatDecimal(number){
    return Math.round(number*100)/100;
  }

}
