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
    this.results.subscribe(wb => this.parseXLSX(wb));
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      console.log('reader load file');
      this._worker.createWorker(this.readXLSX, [JSON.stringify(e)]);
      const msgToWorker = {url: document.location.protocol + '//' + document.location.host, msg: 'Start Worker'};
      this._worker.postMessageToWorker(msgToWorker);
      this._worker.worker.addEventListener('message', (evt) =>  console.log(evt.data));
    };
    reader.readAsBinaryString(target.files[0]);
  }

  readXLSX = (e) => {
    console.log('e', JSON.parse(e));
    const bstr: string = JSON.parse(e).target.result;
    console.log('reading', bstr);
    const wb = XLSX.read(bstr, {type: 'binary'});
    console.log('wb', wb);
    return wb;
  }

  parseXLSX = (wb) => {
    console.log('parsing');
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];
    this.data = XLSX.utils.sheet_to_json(ws, { defval: null, blankrows: false});
    console.log(this.data);
  }
}
