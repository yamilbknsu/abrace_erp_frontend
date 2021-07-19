import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { ToastService } from 'src/app/services/toast.service';
import { AccionesService } from '../acciones.service';

@Component({
  selector: 'app-reajuste-extraordinario',
  templateUrl: './reajuste-extraordinario.component.html',
  styleUrls: ['./reajuste-extraordinario.component.css']
})
export class ReajusteExtraordinarioComponent implements OnInit {
  
  contratos = [];
  selectedPropiedadId = '';
  selectedContrato: any = {};

  selectedReajuste: any = {};
  fechasLiqPagoReaj:any = undefined;

  reajustes = [];

  tipos = [{name: 'Absoluto'}, {name: 'Porcentual'}];

  datePickerConfig = {
    locale: 'es'
  }

  constructor(private accionesService: AccionesService, private propiedadesService: PropiedadesService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.accionesService.loadContratosCierre(moment().toDate())
        .subscribe(data => {
          this.contratos = data.map(cont => {
            cont.propiedad = this.propiedadesService.writeDireccionStr(cont.propiedad);
            return cont;
          }).sort((a,b) => a.propiedad.uId > b.propiedad.uId ? 1 : -1);
        });
  }

  changePropiedad(selectedPropiedadId){
    this.reajustes = [];
    this.selectedContrato = this.contratos.filter(cont => cont.propiedad._id == selectedPropiedadId)[0]
    this.newReajuste();
    this.accionesService.loadReajustesExtraordinarios({contrato: this.selectedContrato.contrato._id})
        .subscribe(data => {this.reajustes = data; console.log(data)})
  }

  newReajuste(){
    this.selectedReajuste = {
      userid: this.selectedContrato.contrato.userid,
      contrato: this.selectedContrato.contrato._id,
      valorinicial: this.selectedContrato.contrato.canonactual,
      valorfinal: this.selectedContrato.contrato.canonactual,
      tipo: 'Porcentual',
      reajuste: 0,
      fecha: moment().startOf('month').locale('es')
    }
  }

  updateReajuste(){
    var number = Number.parseFloat((this.selectedReajuste.reajuste + '').replace(',', '.'));
    this.selectedReajuste.reajuste =  !number ? 0 : number;

    console.log(this.selectedReajuste.reajuste)
    if (this.selectedReajuste.tipo == 'Porcentual'){
      var calculo = Math.round(this.selectedReajuste.valorinicial * (1 + this.selectedReajuste.reajuste / 100))
      this.selectedReajuste.valorfinal = calculo ? calculo : 0;
    }else{
      calculo = Math.round(Number.parseFloat(this.selectedReajuste.valorinicial) + Number.parseFloat(this.selectedReajuste.reajuste));
      this.selectedReajuste.valorfinal = calculo ? calculo : 0;
    }

    console.log(this.selectedReajuste);
  }

  selectReajuste(i){
    this.reajustes[i].fecha = moment(this.reajustes[i].fecha);
    this.selectedReajuste = this.reajustes[i];
  }

  guardarReajuste(){
    this.accionesService.loadFechasLiqPagos({propiedad: this.selectedPropiedadId})
        .subscribe(data => {
          this.fechasLiqPagoReaj = data
          var found = false;
          if(this.fechasLiqPagoReaj){
            var periodo = moment(this.selectedReajuste.fecha).startOf('month');
            this.fechasLiqPagoReaj.reajusterentas.forEach(element => {
              if((new Date(element)).getMonth() == periodo.toDate().getMonth() && (new Date(element)).getFullYear() == periodo.toDate().getFullYear()){
                this.toastService.error('Ya se aplicaron los reajustes para este mes');
                found = true;
                return;
              }
            });
          }
          if(found) return;
          this.accionesService.writeReajustesExtraordinarios(this.selectedReajuste)
              .subscribe(() => {
                this.changePropiedad(this.selectedPropiedadId);
                this.toastService.success('Operación realizada con éxito');
              });
        });
  }

  anularReajuste(){
    this.accionesService.loadFechasLiqPagos({propiedad: this.selectedPropiedadId})
    .subscribe(data => {
      this.fechasLiqPagoReaj = data
      var found = false;
      if(this.fechasLiqPagoReaj){
        var periodo = moment(this.selectedReajuste.fecha).startOf('month');
        this.fechasLiqPagoReaj.reajusterentas.forEach(element => {
          if((new Date(element)).getMonth() == periodo.toDate().getMonth() && (new Date(element)).getFullYear() == periodo.toDate().getFullYear()){
            this.toastService.error('No se puede anular, ya se aplicaron los reajustes para este mes');
            found = true;
            return;
          }
        });
      }
      if(found) return;

      this.accionesService.deleteReajustesExtraordinarios(this.selectedReajuste._id)
          .subscribe(() => {
            this.changePropiedad(this.selectedPropiedadId);
            this.toastService.success('Operación realizada con éxito');
          });
    });
  }

  formatMonth(date) {
    if(!date) return 'Presente';

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
}
