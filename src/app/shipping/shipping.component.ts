import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { WebWorkerService } from 'angular2-web-worker';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  providers: [WebWorkerService],
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit {
  data: any;
  results = new Subject<any>();
  constructor(private _worker: WebWorkerService) { }

  ngOnInit() {
    this.results.subscribe(wb => this.parseXLSX(wb));
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      console.log('reader load file');
      const bstr: string = e.target.result;
      this._worker.run(this.readXLSX, bstr);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  readXLSX = (bstr) => {
    console.log('reading');
    const wb = XLSX.read(bstr, {type: 'binary'});
    console.log('wb', wb);
    this.results.next(wb);
  }

  parseXLSX = (wb) => {
    console.log('parsing');
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];
    this.data = XLSX.utils.sheet_to_json(ws, { defval: null, blankrows: false});
    console.log(this.data);
  }
}
