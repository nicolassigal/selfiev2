import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';
import { InfoService } from '../info/info.service';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit {
  data: any;
  results = new Subject<any>();
  xlsxWorker = `self.addEventListener("message", (e) => {
    if(e.data.msg === "Start Worker") {
        importScripts(e.data.url + '/xlsx/xlsx.full.min.js');
        let wb = XLSX.read(e.data.bstr, {type: 'binary'});
        console.log('wb', wb);
        let wsname = wb.SheetNames[0];
        let ws = wb.Sheets[wsname];
        self.postMessage(JSON.stringify(XLSX.utils.sheet_to_json(ws, { defval: null, blankrows: false})));
    }
    if(e.data.msg === "Stop Worker") {
        self.removeEventListener("message");
        self.close();
    }
 });`;

 checkDBWorker = `self.addEventListener("message", (e) => {
  if(e.data.msg === "Start Worker") {
      console.log('data from checkdbWorker', e.data.xlsxData);
      self.postMessage(JSON.stringify(e.data.xlsxData));
  }
  if(e.data.msg === "Stop Worker") {
      self.removeEventListener("message");
      self.close();
  }
});`;
  constructor(
    private _worker: WorkersService,
    private infoService: InfoService,
    private _db: AngularFirestore) {}

  ngOnInit() {
    const data = JSON.parse(sessionStorage.getItem('data'));
    if (data) {
      this.data = data;
    }
  }

  clearData = () => {
    sessionStorage.clear();
  }

  parseXLS = (evt: any) => {
    if (evt.target.files) {
      const target: DataTransfer = <DataTransfer>(evt.target);
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        this._worker.createWorker(this.xlsxWorker);
        const msgToWorker = {url: document.location.protocol + '//' + document.location.host, msg: 'Start Worker', bstr: bstr};
        this._worker.postMessageToWorker(msgToWorker);
        this.infoService.showMessage('<p> Processing... please wait </p>');
        this._worker.worker.addEventListener('message', (response) => {
          this._worker.terminateWorker();
          this.data = JSON.parse(response.data);
          this.saveData(this.data);
        });
      };
      reader.readAsBinaryString(target.files[0]);
    }
  }

  saveData = (data) => {
    this.infoService.showMessage('<p> Checking with database... </p>');
    this._worker.createWorker(this.checkDBWorker);
    const msgToWorker = { msg: 'Start Worker', xlsxData: data };
    this._worker.postMessageToWorker(msgToWorker);
    this._worker.worker.addEventListener('message', (response) => {
      console.log(response.data);
      this.infoService.showMessage('<p> done!! </p>');
      setTimeout(() => { this.infoService.hideMessage(); }, 3000);
    });
  }
}
