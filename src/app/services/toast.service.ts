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

  success(message: string){
    this.ipc.send('success-message', {title: 'Exito', message});
  }

  confirmation(message: string, callback){
    this.ipc.send('confirmation-message', {title: '¿Estás seguro?', buttons:['Si', 'Cancelar',], type: "question", message});
    this.ipc.once('confirmation-response', callback);
  }


}
