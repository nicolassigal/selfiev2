import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit {
  data: any;
  results = new Subject<any>();
  xls = XLSX;
  constructor(private _worker: WorkersService ) {}

  ngOnInit() {
  }

  onFileChange(evt: any) {
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      this._worker.createWorker(this.readXLSX, [bstr]);
      const msgToWorker = {url: document.location.protocol + '//' + document.location.host, msg: 'Start Worker'};
      this._worker.postMessageToWorker(msgToWorker);
      this._worker.worker.addEventListener('message', () =>  console.log('done'));
    };
    reader.readAsBinaryString(evt.target.files[0]);
  }

  readXLSX = (bstr) => {
    console.log('bstr', bstr);
    const wb = XLSX.read(bstr, {type: 'binary'});
    console.log('wb', wb);
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];
    return XLSX.utils.sheet_to_json(ws, { defval: null, blankrows: false});
  }
}
