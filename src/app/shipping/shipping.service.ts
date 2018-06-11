import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  filterSubject: Subject<any> = new Subject<any>();
  dataSubject: Subject<any> = new Subject<any>();
  private xlsxWorker = `
  self.addEventListener("message", (e) => {
    if(e.data.msg === "Start Worker") {
        importScripts(e.data.url + '/xlsx/xlsx.full.min.js');
        let wb = XLSX.read(e.data.bstr, {type: 'binary'});
        let wsname = wb.SheetNames[0];
        let ws = wb.Sheets[wsname];
        self.postMessage(JSON.stringify(XLSX.utils.sheet_to_json(ws, { defval: null, blankrows: false})));
    }
    if(e.data.msg === "Stop Worker") {
        self.removeEventListener("message");
        self.close();
    }
 });
 `;

private checkDBWorker = `
 self.addEventListener("message", (e) => {
    if(e.data.msg === "Start Worker") {
        let toStorage;
        let xls = e.data.xlsData;
        let db = e.data.dbData;
        console.log('db length', db.length);
        if (db.length) {
          toStorage = xls.filter(row => !db.some(entry => +row.hbr_id === +entry.hbr_id));
        } else {
          toStorage = xls;
        }
        console.log('to storage', toStorage);
        self.postMessage(JSON.stringify(toStorage));
    }
    if(e.data.msg === "Stop Worker") {
        self.removeEventListener("message");
        self.close();
    }
  });
`;


  constructor() { }

  getXlsxWorker = () => {
    return this.xlsxWorker;
  }

  getUniqueDBWorker = () => {
    return this.checkDBWorker;
  }
}
