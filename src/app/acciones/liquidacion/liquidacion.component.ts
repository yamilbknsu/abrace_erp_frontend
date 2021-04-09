import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Propiedad } from 'src/app/models/Propiedad';
import { ParametrosService } from 'src/app/parametros/parametros.service';
import { PropiedadesService } from 'src/app/propiedades/propiedades.service';
import { ToastService } from 'src/app/services/toast.service';
import { AccionesService } from '../acciones.service';

@Component({
  selector: 'app-liquidacion',
  templateUrl: './liquidacion.component.html',
  styleUrls: ['./liquidacion.component.css']
})
export class LiquidacionComponent implements OnInit {

  propiedades: any[] = [];
  date: any;

  selectedPropiedadId: string = '';
  selectedPropiedadId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  selectedPropiedad: any = new Propiedad();
  selectedLiquidacion: any = {};

  liquidacionExists = false;
  formaspago: any[] = [{name: 'Transferencia'}, {name: 'Cheque'}, {name: 'Efectivo'}, {name: 'Depósito'}];
  tiposimpuestos: any[] = [{name: 'Porcentual'}, {name: 'Absoluto'}];
  bancos$;

  datePickerConfig = {
    locale: 'es'
  }

  constructor(private route:ActivatedRoute, private parametrosService: ParametrosService,
              private accionesService: AccionesService, private toastService: ToastService,
              private propiedadesService: PropiedadesService, private _cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.date = moment();

    this.route.data.subscribe(data => {
      this.propiedades = data.propiedades;
    });

    this.selectedPropiedadId$.subscribe(id => this.selectedPropiedad = this.propiedades.filter(prop => prop._id == id)?.[0]);

    this.parametrosService.loadBancosFromBackend();
    this.bancos$ = this.parametrosService.bancos$.pipe(
      map(bancos => bancos.map((banco) => { return { name: banco } }))
    );
  }

  changePropiedad(id){
    if(id) this.selectedPropiedadId$.next(id);
    else this.selectedPropiedadId$.next('');
    this.changePeriodo();
  }

  changePeriodo(){
    var liquidaciones = this.selectedPropiedad.liquidaciones.filter(liq => new Date(liq.fecha).getMonth() == new Date(this.date).getMonth())
    if(liquidaciones.length > 0){
      this.liquidacionExists = true;
      this.selectedLiquidacion = liquidaciones[0];
    }
    else{
      this.liquidacionExists = false;
      this.selectedLiquidacion = {};
    }
  }

  addAbono(){
    this.selectedLiquidacion.abonos.push({detalle: 'A', valor: 0});

  }

  removeAbono(){
    this.selectedLiquidacion.abonos = this.selectedLiquidacion.abonos.slice(0, this.selectedLiquidacion.abonos.length - 1);
    this.updateTotales();
  }

  addCargo(){
    this.selectedLiquidacion.cargos.push({concepto: 'A', valor: 0});
  }

  removeCargo(){
    this.selectedLiquidacion.cargos = this.selectedLiquidacion.cargos.slice(0, this.selectedLiquidacion.cargos.length - 1);
    this.updateTotales();    
  }

  updateTotales(){
    var subtotalCargos = +this.selectedLiquidacion.honorarios.valor + +this.selectedLiquidacion.honorarios.impuestos;
    this.selectedLiquidacion.cargos.forEach(cargo => subtotalCargos += +cargo.valor);

    var subtotalAbonos = 0;
    this.selectedLiquidacion.abonos.forEach(abono => subtotalAbonos += +abono.valor);
    
    this.selectedLiquidacion.subtotal = +subtotalAbonos - +subtotalCargos;
    this.selectedLiquidacion.totalCargos = +subtotalCargos;
    this.selectedLiquidacion.totalAbonos = +subtotalAbonos;
  }

  onGuardar(){
    if(!this.liquidacionExists){
      this.accionesService.writeLiquidacion(this.selectedLiquidacion)
          .subscribe(() => {
            this.toastService.success('Operación realizada con éxito');
            window.location.reload();
          })
    }
  }

  preparar(){
    this.accionesService.loadBoletasLiquidaciones(this.selectedPropiedadId, this.date.toDate())
        .subscribe(boletas => {
          var abonos = [];
          var cargos = [];
          var totalAbonos = 0;
          var totalCargos = 0;
          var subtotal = 0;

          boletas.forEach(element => {
            abonos.push({concepto: 'Renta', valor: element.valorfinal});
            totalAbonos += +element.valorfinal;
          });

          this.selectedPropiedad.mandato.otrosdestinatarios.forEach(element => {
            var valor = element.tipocalculo == 'Porcentual' ? +element.monto * totalAbonos / 100 : +element.monto;
            cargos.push({concepto: "Pago a " + element.nombre + ", " + element.formapago + " cta. " + element.nrocuenta + 
                        " banco " + element.banco, valor: valor});
            totalCargos += valor;
          });


          var comisiones = this.selectedPropiedad.mandato.comisiones;
          var honorarios = {tipo: comisiones.tipoadm,
                            valor: comisiones.tipoadm == "Porcentual" ?
                                      +comisiones.valoradm * totalAbonos / 100 :
                                      +comisiones.valoradm,
                            descripcion: (comisiones.tipoadm == "Porcentual" ?
                                        +comisiones.valoradm + "%" : 
                                        "$" + +comisiones.valoradm) + 
                                        (comisiones.admimpuestoincluido ? " inc. impuestos" : " no inc. impuestos"),
                            impuestos: comisiones.admimpuestoincluido ? 0 :
                                      (+comisiones.impuestoadm * totalAbonos / 100)
                          };
          
          totalCargos += honorarios.valor + honorarios.impuestos;
          subtotal = totalAbonos - totalCargos;

          this.selectedLiquidacion = {
            fecha: this.date.toDate(),
            abonos,
            cargos,
            totalAbonos,
            totalCargos,
            subtotal,
            honorarios,
            formapago: this.selectedPropiedad.mandato.liquidacion.formapago,
            documento:this.selectedPropiedad.mandato.liquidacion.cuenta,
            banco: this.selectedPropiedad.mandato.liquidacion.banco,
            userid: this.selectedPropiedad.userid,
            propiedad: this.selectedPropiedadId
          }
        });
  }


  formatDate(date) {
    if(!date) return 'Presente';

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

}
