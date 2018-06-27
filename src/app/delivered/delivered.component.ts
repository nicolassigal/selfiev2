import { AuthService } from './../shared/auth.service';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';
import { InfoService } from '../info/info.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { TableService } from '../shared/hbr-table/table.service';
import { saveAs } from 'file-saver';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import * as _moment from 'moment';
import { DataService } from '../shared/data.service';
@Component({
  selector: 'app-delivered',
  templateUrl: './delivered.component.html',
  styleUrls: ['./delivered.component.scss']
})
export class DeliveredComponent implements OnInit {
  loadingData = false;
  moment = _moment;
  data = [];
  tableData = [];
  customers = [];
  fileUploader = '';
  role = 0;
  cols = [
    { columnDef: 'hbr_id', header: 'Hbr id', type: '', cell: (element) => `${element.hbr_id}` },
    { columnDef: 'warehouse', header: 'Origin', type: '', cell: (element) => `${element.warehouse ? element.warehouse : ''}` },
    { columnDef: 'box_qty', header: 'Box qty.', type: '', cell: (element) => `${element.box_qty > 0 ? element.box_qty : element.initial_qty}` },
    { columnDef: 'total_weight', header: 'Total Weight', type: 'weight', cell: (element) => `${element.total_weight ? element.total_weight : 0}` },
    { columnDef: 'total_value', header: 'Total Value', type: 'value', cell: (element) => `${element.total_value ? element.total_value : 0}` },
    { columnDef: 'description', header: 'Description', type: '', cell: (element) => `${element.description ? element.description : ''}` },
    { columnDef: 'customer', header: 'Customer', type: '', cell: (element) => `${element.customer ? element.customer : ''}` },
    { columnDef: 'date', header: 'WH In date', type: 'date', cell: (element) => `${element.date ? element.date : ''}` },
    { columnDef: 'received_date', header: 'Delivered', type: 'date', cell: (element) => `${element.received_date ? element.received_date : ''}` },
    { columnDef: 'destination', header: 'Final Destination', type: '', cell: (element) => `${element.destination ? element.destination : ''}` }

  ];

  constructor(
    private _worker: WorkersService,
    private infoService: InfoService,
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private _authService: AuthService,
    private _dataService: DataService,
    private _tableService: TableService) {}

  ngOnInit() {
    this.customers = this._dataService.getCustomers();
    this.tableData = this._dataService.getDelivered();
    this.role = this._authService.getRole();
    if (!this.tableData.length) {
      this.loadingData = true;
    }
    this._dataService.deliveredSubject.subscribe(data => this.filterData(data));

    if (!this.customers.length) {
      this._dataService.customerSubject.subscribe(customers => {
        this.customers = customers;
        this.filterData(this.tableData);
      });
    } else {
      this.filterData(this.tableData);
    }
  }

  filterData = (data) => {
      const user = this.customers.filter(customer => customer.username === this._auth.auth.currentUser.email)[0];
      const role = user['role']  || 0;
      this.role = role;
      const id = user['id'];
      const wh_id = user['wh_id'] || null;
      switch (role) {
        case 0: data = data.filter(row => row['customer_id'] === id);
        break;
      case 1: data = data.filter(row => row['wh_id'] === wh_id);
        break;
      case 2: data = data;
        break;
      default: data = [];
      }

    this.loadingData = false;
    this.tableData = data;
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
          this.prepareData(this.tableData, JSON.parse(response.data));
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
    const ordered = JSON.parse(JSON.stringify(this.tableData));
    ordered.map(row => {
      row.wh_in_date = row.date ? this.moment.unix(row.date).format('DD-MM-YYYY') : null;
      row.received_date = row.received_date ? this.moment.unix(row.received_date).format('DD-MM-YYYY') : null;

      delete row.shipping_date;
      delete row.doc_id;
      delete row.deleted;
      delete row.proforma;
      delete row.tracking;
      delete row.courier;
      delete row.feature;
      delete row.date;
    });
    const worksheet: any = XLSX.utils.json_to_sheet(ordered.sort((row1, row2) => Number(row1.hbr_id) - Number(row2.hbr_id)), { header: [
      'hbr_id',
      'wh_id',
      'warehouse',
      'box_qty',
      'total_weight',
      'total_value',
      'description',
      'customer_id',
      'customer',
      'wh_in_date',
      'received_date',
      'destination'
    ]});
    const workbook: any = { Sheets: { 'delivered': worksheet }, SheetNames: ['delivered'] };
    const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', bookSST: true, type: 'binary'});
    saveAs(new Blob([this.s2ab(excelBuffer)], {type: 'application/octet-stream'}), 'delivered.xlsx');
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
