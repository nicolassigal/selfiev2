import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';
import { InfoService } from '../info/info.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { resetFakeAsyncZone } from '@angular/core/testing';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit {
  data: any;
  results = new Subject<any>();
  dataToBeAdded;
  dataToBeUpdated;
  xlsxWorker = `self.addEventListener("message", (e) => {
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
 });`;

 checkDBWorker = `self.addEventListener("message", (e) => {
  if(e.data.msg === "Start Worker") {
      let toStorage;
      let xls = e.data.xlsData;
      let db = e.data.dbData;
      console.log('db length', db.length);
      if (db.length) {
        toStorage = xls.filter(row => !db.some(entry => row.hbr_id === entry.hbr_id));
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
});`;
  constructor(
    private _worker: WorkersService,
    private infoService: InfoService,
    private _db: AngularFirestore) {}

  ngOnInit() {
    this._db.collection('operations')
    .valueChanges()
    .subscribe(data => {
      this.data = data;
      console.log('new data!');
    });
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
          this.prepareData(this.data, JSON.parse(response.data));
        });
      };
      reader.readAsBinaryString(target.files[0]);
    }
  }

  prepareData = (data, xls) => {
    this.infoService.showMessage('<p> Preparing Data... </p>');
    this._worker.createWorker(this.checkDBWorker);
    const msgToWorker = { msg: 'Start Worker', xlsData: xls, dbData: data };
    this._worker.postMessageToWorker(msgToWorker);
    this._worker.worker.addEventListener('message', (response) => {
      this._worker.terminateWorker();
      const result = JSON.parse(response.data);
      if (result.length) {
        this.addEntry(result);
      } else {
        this.infoService.showMessage('<p> Nothing to update. </p>');
        setTimeout(this.finishProccesing, 3000);
      }
    });
  }

  addEntry = (data) => {
    this.infoService.showMessage(`<p> Updating database with ${data.length} new entries </p>'`);
    const promiseArr = [];
    data.map(entry => {
      promiseArr.push(this._db.collection('operations').add(entry));
    });

    Promise.all(promiseArr)
      .then(res => console.log(res))
      .then(() => this.finishProccesing())
      .catch(res => console.log(res));
  }

  updateEntry = () => {

  }

  finishProccesing = () => {
    this.infoService.showMessage('<p> Done </p>');
    setTimeout(this.infoService.hideMessage, 3000);
  }
}
