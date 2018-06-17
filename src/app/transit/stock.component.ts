import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';
import { InfoService } from '../info/info.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { TableService } from '../shared/hbr-table/table.service';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  loadingData = false;
  data;
  fileUploader = '';
  cols = [
    { columnDef: 'hbr_id', header: 'Hbr id', cell: (element) => `${element.hbr_id}` },
    { columnDef: 'warehouse', header: 'Warehouse', cell: (element) => `${element.warehouse ? element.warehouse : ''}` },
    { columnDef: 'box_qty', header: 'Box qty.', cell: (element) => `${element.box_qty ? element.box_qty : ''}` },
    {
      columnDef: 'total_weight', header: 'Total Weight', cell: (element) =>
        `${element.total_weight ? element.total_weight + ' Kg.' : ''}`
    },
    { columnDef: 'total_value', header: 'Total Value', cell: (element) => `${element.total_value ? 'U$D' + element.total_value : ''}` },
    { columnDef: 'description', header: 'Description', cell: (element) => `${element.description ? element.description : ''}` },
    { columnDef: 'customer', header: 'Customer', cell: (element) => `${element.customer ? element.customer : ''}` },
    { columnDef: 'date', header: 'WH In date', cell: (element) => `${element.date ? element.date : ''}` }
  ];

  constructor(
    private _worker: WorkersService,
    private infoService: InfoService,
    private _db: AngularFirestore,
    private _tableService: TableService) { }

  ngOnInit() {
    this.loadingData = true;
    this._db.collection('operations', ref => ref.orderBy('hbr_id', 'desc'))
      .valueChanges()
      .subscribe(data => {
        this.loadingData = false;
        this.data = data;
      });
  }

  parseXLS = (evt: any) => {
    if (evt.target.files) {
      const target: DataTransfer = <DataTransfer>(evt.target);
      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const msgToWorker = {
          url: `${document.location.protocol}//${document.location.host}`,
          msg: 'Start Worker',
          bstr: bstr
        };

        this.infoService.showMessage(`<ul><li><p>Getting data... Please Wait</p></li></ul>`);

        this._worker.createWorker(this._worker.getXlsxWorker());
        this._worker.postMessageToWorker(msgToWorker);
        this._worker.worker.addEventListener('message', (response) => {
          this.infoService.showMessage(`<ul><li><p>Getting data... Finished </p></li></ul>`);
          this._worker.terminateWorker();
          this.prepareData(this.data, JSON.parse(response.data));
        });
      };

      reader.readAsBinaryString(target.files[0]);
    }
  }

  prepareData = (data, xls) => {
    const msgToWorker = { msg: 'Start Worker', xlsData: xls, dbData: data };
    this.infoService.showMessage(`
    <ul>
      <li><p>Getting data... Finished </p></li>
      <li><p>Preparing data... Please wait </p></li>
    </ul>
    `);

    this._worker.createWorker(this._worker.getUniqueDBWorker());
    this._worker.postMessageToWorker(msgToWorker);
    this._worker.worker.addEventListener('message', (response) => {
      this._worker.terminateWorker();
      const result = JSON.parse(response.data);
      if (result.length) {
        this.addEntry(result);
      } else {
        this.infoService.showMessage(`
        <ul>
          <li><p>Getting data... Finished </p></li>
          <li><p>Preparing data... Finished </p></li>
          <li><p>Nothing to update. </p></li>
        </ul>
        `);
        setTimeout(this.finishProccesing, 3000);
      }
    });
  }

  addEntry = (data) => {
    const promiseArr = [];
    this.infoService.showMessage(`
    <ul>
      <li><p>Getting data... Finished </p></li>
      <li><p>Preparing data... Finished </p></li>
      <li><p>Updating ${data.length} new entries... please wait </p></li>
    </ul>
    `);

    data.map(entry => {
      entry.hbr_id = !isNaN(entry.hbr_id) ? Number(entry.hbr_id) : null;
      entry.box_qty = !isNaN(entry.box_qty) ? Number(entry.box_qty) : null;
      entry.total_value = !isNaN(entry.total_value) ? Number(entry.total_value) : null;
      entry.total_weight = !isNaN(entry.total_weight) ? Number(entry.total_weight) : null;
      entry.customer = entry.customer && entry.customer.length ? this.capitalizeText(entry.customer) : null;
      entry.warehouse = entry.warehouse && entry.warehouse.length ? this.capitalizeText(entry.warehouse) : null;
      entry.courier = entry.courier && entry.courier.length ? this.capitalizeText(entry.courier) : null;
      if (entry.hbr_id) {
        promiseArr.push(this._db.collection('operations').add(entry));
      }
    });

    Promise.all(promiseArr)
      .then(res => console.log(res))
      .then(() => {
        this.infoService.showMessage(`
        <ul>
          <li><p>Getting data... Finished </p></li>
          <li><p>Preparing data... Finished </p></li>
          <li><p>Updating ${data.length} new entries... Finished</p></li>
        </ul>
        `);
        this.finishProccesing();
        this._tableService.dataSubject.next(this.data);
      })
      .catch(res => console.log(res));
  }

  finishProccesing = () => {
    this.fileUploader = '';
    setTimeout(this.infoService.hideMessage, 3000);
  }

  setFilterData = (data) => {
    this._tableService.filterSubject.next(data);
  }

  capitalizeText = (text) => {
    return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    })).join(' ');
  }

  download = () => {
    const ordered = [...this.data];
    const worksheet: any = XLSX.utils.json_to_sheet(ordered.sort((row1, row2) => Number(row1.hbr_id) - Number(row2.hbr_id)), {
      header: [
        'hbr_id',
        'warehouse',
        'courier',
        'customer',
        'contact_name',
        'cuit',
        'email',
        'tel',
        'address',
        'city',
        'country',
        'date',
        'description',
        'destination',
        'proforma',
        'shipping_date',
        'box_qty',
        'total_value',
        'total_weight',
        'tracking'
      ]
    });
    const workbook: any = { Sheets: { 'stock': worksheet }, SheetNames: ['stock'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    saveAs(new Blob([this.s2ab(excelBuffer)], { type: 'application/octet-stream' }), 'stock.xlsx');
  }

  s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }
}
