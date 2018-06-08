import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  public worker: Worker;
  constructor() { }

  createWorker(body: Function, param: Array<any>) {
    const params = JSON.stringify(param).slice(1, -1);
    const blob = new Blob([
         `self.addEventListener("message", (e) => {
             if(e.data.msg === "Start Worker") {
                 importScripts(e.data.url + '/xlsx/cpexcel.js');
                 importScripts(e.data.url + '/xlsx/jszip.js');
                 importScripts(e.data.url + '/xlsx/shim.min.js');
                 importScripts(e.data.url + '/xlsx/xlsx.core.min.js');
                 importScripts(e.data.url + '/xlsx/xlsx.extendscript.js');
                 importScripts(e.data.url + '/xlsx/xlsx.full.min.js');
                 importScripts(e.data.url + '/xlsx/xlsx.min.js');
                 importScripts(e.data.url + '/xlsx/xlsx.js');
                 let wb = XLSX.read(e.bstr, {type: 'binary'});
                 console.log('wb', wb);
                 let wsname = wb.SheetNames[0];
                 let ws = wb.Sheets[wsname];
                 self.postMessage(JSON.stringify(XLSX.utils.sheet_to_json(ws, { defval: null, blankrows: false})));
             }
             if(e.data.msg === "Stop Worker") {
                 self.close();
             }
          });`]);

    const blobURL = window.URL.createObjectURL(blob);
    this.worker = new Worker(blobURL);
 }

  postMessageToWorker(msg) {
    console.log('postMessageToWorker', msg);
    this.worker.postMessage(msg);
  }

  terminateWorker() {
    this.worker.terminate();
  }
}
