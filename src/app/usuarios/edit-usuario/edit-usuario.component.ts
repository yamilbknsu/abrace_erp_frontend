import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { ToastService } from 'src/app/services/toast.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styleUrls: ['./edit-usuario.component.css']
})
export class EditUsuarioComponent implements OnInit {

  @Input() _usuario;
  @Input() self = false;
  @Input() nuevo = false;

  users;
  selectedUser = '';

  _permissions:any = [];
  permissions = {propiedades: false, mandatos: false, contratos: false, personas: false, ingresos: false, egresos: false,
                 liquidacion: false, pagos: false, cierresmes: false, reajustesrentas: false, reajusteextraordinario: false,
                 infpropiedades: false, infreajustes: false, resumenliq: false, resumenpago: false, estadopagos: false, instpago: false,
                 parametros: false}
  
  new_pass = '';
  new_pass_repeat = '';

  constructor(private route: ActivatedRoute, private queryService: QueryService, private toastService: ToastService,
              private router: Router, private usersService:UsersService) { }

  ngOnInit(): void {
    this.users = this.usersService.loadUsers().pipe(
      map(users => users.filter(u => u._id != localStorage.getItem('real_id')))
    );
  }

  reiniciarContrasena(){
    const new_pass = this._usuario.username + (new Date(this._usuario.creationDate)).getMonth() + (new Date(this._usuario.creationDate)).getDate()
    this.toastService.confirmation('¿Estás seguro de reiniciar la contraseña para este usuario?', (event, response) => {
      if(response == 1){
        var usuario = {... this._usuario}
        usuario.password = new_pass;

        this.queryService.executePostQuery('auth', 'user', usuario, {id: this._usuario._id})
        
      .subscribe(data =>
          this.toastService.success(`Operación realizada con éxito.\nContraseña provisoria es: ${new_pass}\nPor favor, ingresa con tu cuenta para cambiarla.`)
        )
      }
    })
  }

  onGuardar(){
    this.queryService.executePostQuery('auth', 'user', this._usuario, {id: this._usuario._id})
        
    .subscribe(data =>
        this.toastService.success('Operación realizada con éxito.\nReiniciar para ver cambios.')
      )
  }

  cambiarContrasena(){
    if(this.new_pass.length < 8) return this.toastService.error('Contraseña nueva muy corta');
    if(this.new_pass !== this.new_pass_repeat) return this.toastService.error('Contraseñas no coinciden');

    this.toastService.confirmation('¿Estás seguro de guardar todos los cambios y cambiar la contraseña?', (event, response)=>{
      if(response == 1){
        var usuario = {... this._usuario}
        usuario.password = this.new_pass;

        this.queryService.executePostQuery('auth', 'user', usuario, {id: this._usuario._id})
        
      .subscribe(data =>
          this.toastService.success(`Operación realizada con éxito.`)
        )
      }
    })
  }

  onCreateUser(){
    this._usuario.permissions = ['read-all', 'write-all', 'update-all', 'delete-all']
    this._usuario.password = this.new_pass;

    this.queryService.executePostQuery('auth', 'register', this._usuario, {})
        
    .subscribe(data =>
        {
          this.toastService.success('Operación realizada con éxito.');
          window.location.reload();
        }
      )
  }

  onDeleteuser(){
    this.toastService.confirmation('¿Estás seguro de eliminar este usuario?', (event, response) => {
      if(response == 1){
        this.queryService.executeDeleteQuery('auth', 'user', {}, {id: this._usuario._id})
        
      .subscribe(data =>{
          this.toastService.success(`Operación realizada con éxito.`);
          window.location.reload();
        }
        )
      }
    })
  }

  logout(){
    this.router.navigate([{ outlets: { primary: 'login' }}], { queryParams: { expired: false } });
  }

  changeSelectedUser(){
    this.queryService.executeGetQuery('auth', 'externalpermissions', {}, {user:this.selectedUser})
        .subscribe(permissions => {
          console.log(permissions)

          this.permissions = this.newPermissions()
          if(permissions.length == 0) return;
          
          var perms = permissions[0].permissions

          this._permissions = perms;
          if(perms.includes('admin')){
            this.permissions = this.newPermissions(true)
            return;
          }

          if(perms.includes('propiedades')) this.permissions.propiedades = true;
          if(perms.includes('mandatos')) this.permissions.mandatos = true;
          if(perms.includes('contratos')) this.permissions.contratos = true;
          if(perms.includes('personas')) this.permissions.personas = true;
          if(perms.includes('ingresos')) this.permissions.ingresos = true;
          if(perms.includes('egresos')) this.permissions.egresos = true;
          if(perms.includes('liquidacion')) this.permissions.liquidacion = true;
          if(perms.includes('pagos')) this.permissions.pagos = true;
          if(perms.includes('cierresmes')) this.permissions.cierresmes = true;
          if(perms.includes('reajustesrentas')) this.permissions.reajustesrentas = true;
          if(perms.includes('reajusteextraordinario')) this.permissions.reajusteextraordinario = true;
          if(perms.includes('infpropiedades')) this.permissions.infpropiedades = true;
          if(perms.includes('infreajustes')) this.permissions.infreajustes = true;
          if(perms.includes('resumenliq')) this.permissions.resumenliq = true;
          if(perms.includes('resumenpago')) this.permissions.resumenpago = true;
          if(perms.includes('estadopagos')) this.permissions.estadopagos = true;
          if(perms.includes('instpago')) this.permissions.instpago = true;
          if(perms.includes('parametros')) this.permissions.parametros = true;
        });
  }

  savePermissions(){
    var newPermissions = ['read-all'];
    if(this.permissions.propiedades == true) newPermissions.push('propiedades');
    if(this.permissions.mandatos == true) newPermissions.push('mandatos');
    if(this.permissions.contratos == true) newPermissions.push('contratos');
    if(this.permissions.personas == true) newPermissions.push('personas');
    if(this.permissions.ingresos == true)               newPermissions.push('ingresos')   
    if(this.permissions.egresos == true)                newPermissions.push('egresos')              
    if(this.permissions.liquidacion == true)            newPermissions.push('liquidacion')      
    if(this.permissions.pagos == true)                  newPermissions.push('pagos')               
    if(this.permissions.cierresmes == true)             newPermissions.push('cierresmes')         
    if(this.permissions.reajustesrentas == true)        newPermissions.push('reajustesrentas')   
    if(this.permissions.reajusteextraordinario == true) newPermissions.push('reajusteextraordinario')
    if(this.permissions.infpropiedades == true)         newPermissions.push('infpropiedades')  
    if(this.permissions.infreajustes == true)           newPermissions.push('infreajustes')  
    if(this.permissions.resumenliq == true)             newPermissions.push('resumenliq')     
    if(this.permissions.resumenpago == true)            newPermissions.push('resumenpago')       
    if(this.permissions.estadopagos == true)            newPermissions.push('estadopagos')       
    if(this.permissions.instpago == true)               newPermissions.push('instpago')        
    if(this.permissions.parametros == true)             newPermissions.push('parametros')
    
    this.queryService.executePostQuery('auth', 'externalpermissions', {permissions: newPermissions}, {user: this.selectedUser})
        .subscribe(() => this.toastService.success('Operación realizada con éxito.'))

  }

  newPermissions(def=false){
    return {propiedades: def, mandatos: def, contratos: def, personas: def, ingresos: def, egresos: def,
      liquidacion: def, pagos: def, cierresmes: def, reajustesrentas: def, reajusteextraordinario: def,
      infpropiedades: def, infreajustes: def, resumenliq: def, resumenpago: def, estadopagos: def, instpago: def,
      parametros: def}
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

}
