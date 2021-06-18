export class Persona{
    _id: string = '';
    userid: string = '';
    rut : string = '';
    dv: string = '';
    nombre: string = '';
    actividad: string = '';
    empresa: string = '';
    cargo: string = '';
    dirParticular: string = '';
    dirComercial: string = '';
    telefonos: Array<string> = [];
    emails: Array<string> = [];
    ismandante: Boolean;
    personalidad: string = 'Natural';
    representante: any = {};

    constructor(ismandante=true){
        this.ismandante = ismandante;
    }
}