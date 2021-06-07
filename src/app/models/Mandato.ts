export class Mandato{
    _id:string;
    userid:string;
    propiedad: string;
    fechaInicio: Date;
    fechaTermino: Date;
    firmacontrato: string;
    enviocorresp: string;
    liquidacion;
    comisiones;
    instrucciones: Array<any>;
    contribuciones: boolean;
    contribucionesdesc: string;
    aseo: boolean;
    aseodesc: string;
    otro: boolean;
    otrodesc: string;
    otrosdestinatarios;

    constructor(
    _id:string,
    userid:string = "",
    propiedad: string ='',
    fechaInicio: Date,
    fechaTermino: Date = new Date(1970, 0, 1),
    firmacontrato: string = '',
    enviocorresp: string = '',
    liquidacion = {},
    comisiones = {},
    otrosdestinatarios = []){
        this._id = _id;
        this.userid = userid;
        this.propiedad = propiedad;
        this.fechaInicio = fechaInicio;
        this.fechaTermino = fechaTermino;
        this.firmacontrato = firmacontrato;
        this.enviocorresp = enviocorresp;
        this.liquidacion = liquidacion;
        this.comisiones = comisiones;
        this.otrosdestinatarios = otrosdestinatarios; 
    };
}