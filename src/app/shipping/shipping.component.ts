import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';
import { InfoService } from '../info/info.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit {
  data: any;
  results = new Subject<any>();
  fileData: any;
  constructor(private _worker: WorkersService, private infoService: InfoService) {}

  ngOnInit() {
    const data = JSON.parse(sessionStorage.getItem('data'));
    if (data) {
      this.data = data;
    }
  }

  clearData = () => {
    sessionStorage.clear();
  }

  onFileChange(evt: any) {
    this.fileData = evt;
  }

  parseXLS = () => {
    const target: DataTransfer = <DataTransfer>(this.fileData.target);
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      this._worker.createWorker();
      const msgToWorker = {url: document.location.protocol + '//' + document.location.host, msg: 'Start Worker', bstr: bstr};
      this._worker.postMessageToWorker(msgToWorker);
      this.infoService.showMessage('<p> Processing... please wait </p>');
      this._worker.worker.addEventListener('message', (response) => {
        console.log(response);
        sessionStorage.setItem('data', response.data);
        this.data = JSON.parse(response.data);
        this.infoService.showMessage('<p> Done! </p>');
        setTimeout(() => { this.infoService.hideMessage(); }, 3000);
      });
    };

    reader.readAsBinaryString(target.files[0]);
  }
}
