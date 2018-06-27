import { AuthService } from './../shared/auth.service';
import { DataService } from './../shared/data.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { DeleteTransitDialogComponent } from './dialogs/delete/delete.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';
import { InfoService } from '../info/info.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { TableService } from '../shared/hbr-table/table.service';
import { saveAs } from 'file-saver';
import { ReceivedStockDialogComponent } from './dialogs/received/received.component';
import { MatDialog } from '@angular/material';
import { EditTransitDialogComponent } from './dialogs/edit/edit.component';
import { ExpandTransitDialogComponent } from './dialogs/expand/expand.component';
import * as _moment from 'moment';
import { take } from 'rxjs/operators';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-transit',
  templateUrl: './transit.component.html',
  styleUrls: ['./transit.component.scss']
})
export class TransitComponent implements OnInit, OnDestroy {
  loadingData = false;
  isMakingChangesOnData = false;
  moment = _moment;
  data = [];
  tableData = [];
  fileUploader = '';
  role = 0;
  couriers = [];
  customers = [];
  warehouses = [];
  status = [];
  operations = [];
  setCols = false;
  cols = [];

  constructor(
    private _worker: WorkersService,
    private infoService: InfoService,
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private _authService: AuthService,
    private _tableService: TableService,
    private _dataService: DataService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this.cols.push({ columnDef: 'id', header: 'Id', cell: (element) => `${element.id}` },
    { columnDef: 'box_qty', header: 'Box qty.', cell: (element) => `${element.box_qty ? element.box_qty : ''}` },
    { columnDef: 'total_weight', header: 'Total Weight', type: 'weight', cell: (element) => `${element.total_weight ? element.total_weight : ''}` },
    { columnDef: 'total_value', header: 'Total Value', type: 'value', cell: (element) => `${element.total_value ? element.total_value : ''}` },
    { columnDef: 'shipping_date', header: 'Shipping Date', type: 'date', cell: (element) => `${element.shipping_date ? element.shipping_date : ''}` },
    { columnDef: 'courier', header: 'Courier', type: '', cell: (element) => `${element.courier ? element.courier : ''}` },
    { columnDef: 'tracking', header: 'Tracking', type: '', cell: (element) => `${element.tracking ? element.tracking : ''}` },
    { columnDef: 'destination', header: 'Destination', type: '', cell: (element) => `${element.destination ? element.destination : ''}` },
    { columnDef: 'status', header: 'Status', type: '', cell: (element) => `${element.status ? element.status : ''}` });

    this.customers = this._dataService.getCustomers();
    this.couriers = this._dataService.getCouriers();
    this.warehouses = this._dataService.getWarehouses();
    this.customers = this._dataService.getCustomers();
    this.tableData = this._dataService.getAwbs();
    this.status = this._dataService.getStatus();
    this.operations = this._dataService.getStock();
    this.role = this._authService.getRole();
    if (!this.tableData.length) {
      this.loadingData = true;
    }
    this._dataService.couriersSubject.subscribe(couriers => this.couriers = couriers);
    this._dataService.warehouseSubject.subscribe(warehouses => this.warehouses = warehouses);
    this._dataService.statusSubject.subscribe(status => this.status = status);
    this._dataService.awbsSubject.subscribe(awbs =>  this.filterData(awbs));
    this._dataService.stockSubject.subscribe(stocks => this.operations = stocks);

    if (!this.customers.length) {
      this._dataService.customerSubject.subscribe(customers => {
        this.customers = customers;
        this.filterData(this.tableData);
      });
    } else {
      this.filterData(this.tableData);
    }
  }

  ngOnDestroy() {
  }

  filterData = (data) => {
    let showEdit = false;
    let showDelete = false;
    let showReceived = false;
    const user = this.customers.filter(customer => customer.username === this._auth.auth.currentUser.email)[0];
    const role = user.role || 0;
    this.role = role;
    if (role === 2 && !this.setCols) {
      this.setCols = true;
      showEdit = true;
      showDelete = true;
      showReceived = true;
    }
    if (!this.cols.some(header => header.columnDef === 'actions')) {
      this.cols.unshift({
        columnDef: 'actions',
        header: 'Actions',
        type: '',
        showEdit: showEdit,
        showDelete: showDelete,
         showReceived: showReceived,
         showExpand: true,
         cell: (element) => ''
      });
    }

    const id = user['id'];
    const wh_id = user['wh_id'] || null;
    switch (role) {
      case 0: data = this._getData(data, id);
        break;
      case 1: data = data.filter(row => row['wh_id'] === wh_id);
        break;
      case 2: data = data;
        break;
      default: data = [];
    }

    data = data.filter(row => row['status_id'] !== 3);
    data.map(row => {
      row.courier = this.couriers.filter(courier => courier.id === row.courier_id)[0].name;
      row.status = this.status.filter(e => e.id === row.status_id)[0];
      row.status_id = row.status ? row.status.id : 0;
      row.status =  row.status ? row.status.name : null;
      row.destination = this.getDestination(row);
    });
    this.loadingData = false;
    this.tableData = data;
  }

  getDestination = (row) => {
    let destination = null;
    if (row.wh_id) {
      const warehouse = this.warehouses.filter(wh => wh.id === row.wh_id)[0];
      destination = warehouse.name ? `WH: ${warehouse.name}` : null;
    } else if (row.customer_id) {
      const customer = this.customers.filter(cs => cs.id === row.customer_id)[0];
      destination = customer.name ? `${customer.name}` : null;
    }
    return destination;
  }

  onExpandRowDataEvent = (row) => {
    this._dialog.open(ExpandTransitDialogComponent, {
      data: {
        row: row,
        op: this.operations,
        title: 'Processes',
        confirmBtn: 'Ok',
      }, width: '500px'
    });
  }

  onReceivedRow = (row) => {
      this._dialog.open(ReceivedStockDialogComponent, {
        data: {
          row: row,
          operations: this.operations,
          status: this.status,
          warehouses: this.warehouses,
          couriers: this.couriers,
          customers: this.customers,
          awbs: this.tableData,
          title: 'Mark as...',
          confirmBtn: 'Ok',
          cancelBtn: 'Cancel'
        }, width: '300px'
      });
  }

  onEditRow = (row) => {
      this._dialog.open(EditTransitDialogComponent, {
        data: {
          row: row,
          operations: this.operations,
          status: this.status,
          warehouses: this.warehouses,
          couriers: this.couriers,
          customers: this.customers,
          awbs: this.tableData,
          title: 'Edit Box in transit',
          confirmBtn: 'Edit',
          cancelBtn: 'Cancel'
        }, width: '500px'
      });
  }

  onDeleteRow = (row) => {
      this._dialog.open(DeleteTransitDialogComponent, {
        data: {
          row: row,
          op: this.operations,
          title: 'Delete Box in transit',
          confirmBtn: 'Delete',
          cancelBtn: 'Cancel'
        }, width: '500px'
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
      row.shipping_date = row.shipping_date ? this.moment.unix(row.shipping_date).format('DD-MM-YYYY') : null;
      row.processes_list = '';
      row.processes.map(process => {
        row.processes_list = `${row.processes_list} ${process.hbr_id}`;
      });

      delete row.processes;
      delete row.quantity;
    });

    const worksheet: any = XLSX.utils.json_to_sheet(ordered.sort((row1, row2) => Number(row1.id) - Number(row2.id)), {
      header: [
        'id',
        'processes_list',
        'box_qty',
        'total_weight',
        'total_value',
        'shipping_date',
        'courier_id',
        'courier',
        'tracking',
        'wh_id',
        'customer_id',
        'destination',
        'status_id',
        'status'
      ]
    });
    const workbook: any = { Sheets: { 'in_transit': worksheet }, SheetNames: ['in_transit'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    saveAs(new Blob([this.s2ab(excelBuffer)], { type: 'application/octet-stream' }), 'in_transit.xlsx');
  }

  s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  _getData = (data, id) => {
    data = data.map(row => {
      row.box_qty = 0;
      row.total_weight = 0;
      row.total_value = 0;
      row.processes = row.processes.filter(p => {
        if (p.customer_id === id) {
          row.box_qty = Number(row.box_qty) +  Number(p.box_qty);
          row.total_weight = Number(row.total_weight) +  Number(p.total_weight);
          row.total_value = Number(row.total_value) +  Number(p.total_value);
          return p;
        }
      });
      return row;
    });
    return data;
  }
}
