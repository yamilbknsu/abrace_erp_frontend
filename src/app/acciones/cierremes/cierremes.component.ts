import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
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
  reajustes: any[] = [];
  cierres: any[] = [];

  boletasUpload: any[] = [];
  reajustesUpload: any[] = [];

  ipc = [];

  constructor(private route: ActivatedRoute, private propiedadesService: PropiedadesService,
              private accionesService: AccionesService, private parametrosService: ParametrosService,
              private toastService: ToastService) { }

  ngOnInit(): void {
    this.fecha = moment().startOf('month');

    this.route.data.subscribe(data => {
      this.cierres = data.cierres;
    });

    this.parametrosService.loadIPCFromBackend()
        .subscribe(ipc => this.ipc = ipc[0].values);
  }

  fechaChange(){
    var cierresFecha = this.cierres.filter(c => {
      return new Date(c.fecha).getTime() == new Date(this.fecha).getTime()
    });

    this.boletasUpload = [];
    this.reajustesUpload = [];

    this.reajusteExists = cierresFecha.length > 0;
    this.reajustes = this.reajusteExists ? cierresFecha[0].boletas.concat(cierresFecha[0].reajustes).sort((a,b) => new Date(a.fecha) > new Date(b.fecha) ? 1 : -1) : [];
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

    this.accionesService.loadContratosCierre(this.fecha.endOf('month').toDate())
        .subscribe((data) => {
          if(data?.length > 0){
            data.forEach(element => {

              // Calculos de recibo
              var last_boleta = element.boletas.filter(b => b.tipo == 'Automatico' || b.tipo == 'Inicial')
                     .sort((a,b) => new Date(b.fecha) > new Date(a.fecha) ? 1 : -1)[0]
                     
              const arriendo_diff = this.fecha.startOf('month').diff(moment(last_boleta.fecha).startOf('month'), 'months');
              var arriendo_interval = 1;
              if(element.contrato.tiempoarriendo == 'Mensual') arriendo_interval = 1;
              else if(element.contrato.tiempoarriendo == 'Trimestral') arriendo_interval = 3;
              else if(element.contrato.tiempoarriendo == 'Semestral') arriendo_interval = 6;
              else if(element.contrato.tiempoarriendo == 'Anual') arriendo_interval = 12;

              if(arriendo_diff >= arriendo_interval){
                this.boletasUpload.push({
                  contrato: element.contrato._id,
                  userid: element.contrato.userid,
                  fecha: moment(last_boleta.fecha).add(arriendo_diff, 'M').toDate(),
                  valorinicial: last_boleta.valorfinal,
                  valorfinal: element.contrato.canonactual,
                  estado: "Generado",
                  tipo: "Automatico"
                });

                this.reajustes.push({
                    contrato: element.contrato,
                    userid: element.contrato.userid,
                    fecha: moment(last_boleta.fecha).add(arriendo_diff, 'M').toDate(),
                    valorinicial: last_boleta.valorfinal,
                    valorfinal: element.contrato.canonactual,
                    propiedadData: element.propiedad,
                    estado: "Generado",
                    tipo: "Automatico"
                  })
              }
              
              const reajuste_diff = this.fecha.startOf('month').diff(moment(element.contrato.proximoreajuste).startOf('month'), 'months');
              //if(element.propiedad.uId == 'P01') console.log(reajuste_diff)
              var reajuste_interval = 1;
              if(element.contrato.tiemporeajuste == 'Mensual') reajuste_interval = 1;
              else if(element.contrato.tiemporeajuste == 'Trimestral') reajuste_interval = 3;
              else if(element.contrato.tiemporeajuste == 'Semestral') reajuste_interval = 6;
              else if(element.contrato.tiemporeajuste == 'Anual') reajuste_interval = 12;

              var valor_reajuste = Math.round(this.propiedadesService.calcularReajuste(this.fecha, reajuste_interval, this.ipc) * 1000000) / 1000000

              if(reajuste_diff >= 0){
                this.reajustesUpload.push({
                  contrato: element.contrato._id,
                  userid: element.contrato.userid,
                  fecha: moment(last_boleta.fecha).add(arriendo_diff, 'M').toDate(),
                  valorinicial: element.contrato.canonactual,
                  valorfinal: Math.round(element.contrato.canonactual * (1 + valor_reajuste / 100)),
                  reajuste: valor_reajuste
                });

                this.reajustes.push({
                    contrato: element.contrato,
                    userid: element.contrato.userid,
                    fecha: moment(last_boleta.fecha).add(arriendo_diff, 'M').toDate(),
                    valorinicial: element.contrato.canonactual,
                    valorfinal: Math.round(element.contrato.canonactual * (1 + valor_reajuste / 100)),
                    propiedadData: element.propiedad,
                    reajuste: valor_reajuste
                  })
              }

            });

            this.reajustes = this.reajustes.filter(e => !e.reajuste?.toString()).sort((a,b) => new Date(a.fecha) > new Date(b.fecha) ? 1 : -1)
                             .concat(this.reajustes.filter(e => e.reajuste?.toString()).sort((a,b) => new Date(a.fecha) > new Date(b.fecha) ? 1 : -1));
          }
        });
  }

  aplicar(){
    if(this.boletasUpload.length > 0 || this.reajustesUpload.length > 0){
      this.propiedadesService.cerrarMes(this.fecha.toDate(), this.boletasUpload, this.reajustesUpload)
                .subscribe((data) => {
                    this.accionesService.loadCierresMes()
                        .subscribe(data => {
                          this.cierres = data;
                          this.fechaChange();
                          this.toastService.success('Operación realizada con éxito');
                        })
                });
    }
  }
}
