import { createAotUrlResolver } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

declare var electron: any;

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  private ipc: IpcRenderer;

  constructor() {
    if ((<any>window).require) {
      try {
       this.ipc = (<any>window).require('electron').ipcRenderer;
      } catch (error) {
       throw error;
      }
     } else {
        console.warn('Could not load electron ipc');
     }
  }

  error(message: string){
    this.ipc.send('error-message', {title: 'Error', message});
  }

  warning(message: string){
    this.ipc.send('warning-message', {title: 'Aviso', message});
  }

  success(message: string){
    this.ipc.send('success-message', {title: 'Exito', message});
  }

  confirmation(message: string, callback){
    this.ipc.send('confirmation-message', {title: '¿Estás seguro?', buttons:['Cancelar','Si'], type: "question", message});
    this.ipc.once('confirmation-response', callback);
  }

  fileSaving(filters, defaultPath, callback){
    this.ipc.send('file-saving-message', {title: 'Elija una ubicación para el archivo', filters, defaultPath});
    this.ipc.once('file-saving-response', callback);
  }

  pdfWindow(url, callback){
    this.ipc.send('url-pdf', {url});
    this.ipc.once('url-pdf-response', callback);
  }


}
