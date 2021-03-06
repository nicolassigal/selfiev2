import { ActivatedRoute } from '@angular/router';
import { DataService } from './../shared/data.service';
import { AuthService } from './../shared/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { UtilsService } from './../shared/utils.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MAT_AUTOCOMPLETE_VALUE_ACCESSOR } from '@angular/material';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';
import { InfoService } from '../info/info.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { TableService } from '../shared/hbr-table/table.service';
import { saveAs } from 'file-saver';
import { SendStockDialogComponent } from './dialogs/send-stock/send-stock.component';
import { EditStockDialogComponent } from './dialogs/edit-stock/edit-stock.component';
import * as _moment from 'moment';
import { DeleteStockDialogComponent } from './dialogs/delete/delete.component';
import { take, takeUntil } from 'rxjs/operators';
import { componentDestroyed } from 'ng2-rx-componentdestroyed';
import { SidenavService } from '../app-sidenav/sidenav.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy {
  loadingData = false;
  data = [];
  fileUploader = '';
  role = 0;
  moment = _moment;
  customers = [];
  delivered = [];
  transit = [];
  couriers = [];
  warehouses = [];
  isMakingChangesOnData = false;
  setCols = false;
  cols = [];
  markedRows = [];
  tableData = [];
  dragging = false;
  stockSubscription = new Subscription();

  constructor(
    private _worker: WorkersService,
    private _route: ActivatedRoute,
    private infoService: InfoService,
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private _authService: AuthService,
    private _tableService: TableService,
    private _dialog: MatDialog,
    private authService: AuthService,
    private _utils: UtilsService,
    private _sidenav: SidenavService,
    private _dataService: DataService) { }

  ngOnInit() {
    const snapshotTitle = this._route.snapshot.data.filter;
    const title = snapshotTitle == 'warehouse' ? 'Warehouse Stock' : snapshotTitle == 'users'? 'User Stock' : 'Manage Stock';
    this._sidenav.setTitle(title);

    this.cols.push(
      { columnDef: 'hbr_id', header: 'Hbr id', type: '', cell: (element) => `${element.hbr_id}` },
      { columnDef: 'wr0', header: 'WR0', type: '', cell: (element) => `${element.wr0 ? element.wr0 : ''}` },
      { columnDef: 'tracking', header: 'Tracking', type: '', cell: (element) => `${element.tracking ? element.tracking : ''}` },
      { columnDef: 'customer', header: 'Customer', type: '', cell: (element) => `${element.customer ? element.customer : ''}` },
      { columnDef: 'date', header: 'Entry date', type: 'date', cell: (element) => `${element.date ? element.date : ''}` },
      { columnDef: 'warehouse', header: 'Warehouse', type: '', cell: (element) => `${element.warehouse ? element.warehouse : ''}` },
      { columnDef: 'box_qty', header: 'Box qty.', type: '', cell: (element) => {
        let boxQty = '0';
        boxQty = element.box_qty && element.box_qty === element.initial_qty || element.initial_qty === 0? `${element.box_qty}` : `${element.box_qty}/${element.initial_qty}` ;
        return boxQty;
      }},
      { columnDef: 'total_weight', header: 'Total Weight', type: 'weight', cell: (element) => {
        return `${element.total_weight ? element.total_weight : 0}`;
      }},
      { columnDef: 'entry', header: 'Entry Point', type: '', cell: (element) => {
        return `${element.entry_point && element.entry_point.name ? element.entry_point.name : ''}`
      }},
      { columnDef: 'shipping_date', header: 'Shipping Date', type: 'date', cell: (element) => `${element.shipping_date ? element.shipping_date : ''}` },
      { columnDef: 'description', header: 'Description', type: '', cell: (element) => `${element.description ? element.description : ''}` },
      { columnDef: 'status', header: 'Status', type: '', cell: (element) => `${element.dest_type ?` In ${element.dest_type}` : ''}` }
    );

    this.couriers = this._dataService.getCouriers();
    this.warehouses = this._dataService.getWarehouses();
    this.customers = this._dataService.getCustomers();
    this.tableData = this._dataService.getStock();
    this.delivered = this._dataService.getDelivered();
    this.transit = this._dataService.getAwbs();
    this.role = this._authService.getRole();
    if (!this.tableData.length) {
      this.loadingData = true;
    }
    this._dataService.warehouseSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(warehouses => this.warehouses = warehouses);

    this._dataService.deliveredSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(delivered => this.delivered = delivered);

    this._dataService.awbsSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(awbs => this.transit = awbs);

    this._dataService.stockSubject.subscribe(data => {
      this.tableData = data;
      this.filterData(this.tableData);
    });

    if (!this.customers.length) {
      this._dataService.customerSubject
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(customers => {
        this.customers = customers;
        this.filterData(this.tableData);
      });
    } else {
      this.filterData(this.tableData);
    }
  }

  ngOnDestroy() {
    this.tableData.map(row => row.checked = false);
  }

  genBackup = () => {
    const promises = [];
    this.customers.map(user => {
      promises.push(this._db.collection('backup_users').doc(`${user.id}`).set(user));
    });

    this.warehouses.map(wh => {
      promises.push(this._db.collection('backup_warehouses').doc(`${wh.id}`).set(wh));
    });

    Promise.all(promises).then(res => console.log(res)).catch(err => console.log(err));
  }

  filterData = (data) => {
      const user = this.customers.filter(customer => customer.username === this._auth.auth.currentUser.email)[0];
      const role = user.role || 0;
      this.role = role;
      if (role === 2 && !this.setCols) {
        this.setCols = true;
        this.cols.unshift({
          columnDef: 'select',
          header: 'Select',
          type: '',
          showEdit: true,
          showDelete: true,
          showSendStock: true,
          cell: (element) => ''
        });

        this.cols.splice(6, 0, {
            columnDef: 'profit',
            header: 'Profit',
            type: 'value',
            cell: (element) => `${element.profit ? element.profit : 0}`
          });
      }
      const id = user['id'];
      const wh_id = user['wh_id'] || null;
      switch (role) {
        case 0: data = data.filter(row => Number(row['customer_id']) === Number(id));
          break;
        case 1: data = data.filter(row => Number(row['wh_id']) === Number(wh_id));
          break;
        case 2: data = data;
          break;
        default: data = [];
      }
      data = data.filter(row => row.delivered === 0);
    this.loadingData = false;

    if(this._route.snapshot.data.filter === 'warehouse') {
      this._route.params.subscribe(params => {
        data = data.filter(row => row.wh_id == params.id);
      });
    }

    if(this._route.snapshot.data.filter === 'users') {
      this._route.params.subscribe(params => {
        data = data.filter(row => row.customer_id == params.id);
      });
    }

    if(this._route.snapshot.data.filter === 'stock') {
      this._route.params.subscribe(params => {
        data = data.filter(row => row.hbr_id == params.id);
      });
    }

    this.tableData = data;
    console.log(data);
  }

  onDrop(event) {
    event.preventDefault();
    event['target']['files'] = event.dataTransfer.files;
    this.dragging = false;
    this.parseXLS(event);
  }

  onDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dragging = false;
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
          prod: JSON.parse(sessionStorage.getItem('prod')),
          bstr: bstr
        };

        this.infoService.showMessage(`<ul><li><p>Getting data... Please Wait</p></li></ul>`);

        this._worker.createWorker(this._worker.getXlsxWorker());
        this._worker.postMessageToWorker(msgToWorker);
        this._worker.worker.addEventListener('message', (response) => {
          this.infoService.showMessage(`<ul><li><p>Getting data... Finished </p></li></ul>`);
          this._worker.terminateWorker();
          const data = this.tableData.length ? this.tableData : [];
          data.map(row => {
            Object.keys(row).filter(obj => {
              if (obj.indexOf('__EMPTY') > -1) {
                  delete row[obj];
              }
           });
          });
          this.prepareData(data, JSON.parse(response.data));
        });
      };

      reader.readAsBinaryString(target.files[0]);
    }
  }

  prepareData = (data, xls) => {
    const msgToWorker = { msg: 'Start Worker', xlsData: xls, dbData: data, delivered: this.delivered, transit: this.transit };
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
    const customerBatch = this._db.firestore.batch();
    const newCustomers = [];
    const chunk_size = 250;
    this.infoService.showMessage(`
    <ul>
      <li><p>Getting data... Finished </p></li>
      <li><p>Preparing data... Finished </p></li>
      <li><p>Updating ${data.length} new entries... please wait </p></li>
    </ul>
    `);

    data.map(row => {

      const customerById = this.customers.filter(cs => Number(cs.id) === Number(row.customer_id));
      const whById = this.warehouses.filter(cs => Number(cs.id) === Number(row.wh_id));

      row.customer = customerById.length ? customerById[0].name : row.customer;
      row.warehouse = whById.length ? whById[0].name : row.warehouse;

      const rowCustomer = row.customer ? row.customer.toLowerCase().trim() : null;

      if (!this.customers.some(customer => customer.name.toLowerCase().trim() === rowCustomer)) {
        if (rowCustomer && rowCustomer.length) {
          const id = this._utils.getId(this.customers);
          const customerToAdd = {
            id: id,
            name: this.capitalizeText(rowCustomer),
            products: null,
            cuit: null,
            tel: null,
            email: null,
            address: null,
            contact_name: null,
            country: null,
            city: null,
            username: null,
            password: null,
            deleted: null
          };
          if (!newCustomers.some(e => e.id === customerToAdd.id)) {
            row.customer_id = customerToAdd.id;
            newCustomers.push(customerToAdd);
          }
        }
      } else {
        if (!row.customer_id) {
          row.customer_id = this.customers.filter(customer => customer.name.toLowerCase().trim() === rowCustomer)[0].id;
        }
      }
    });

    newCustomers.map(customer => {
      if (customer) {
        customer.username = `username_${customer.id}@tucourier.com.ar`;
        customer.email = customer.username;
        customer.password = `password_${customer.id}`;
        customer.changed_pwd = false;
        customer.role = 0;
        customer.id = this._utils.getId(this.customers);
        this.authService._addUser(customer.username, customer.password).subscribe();
        const ref = this._db.collection('users').doc(`${customer.id}`).ref;
        customerBatch.set(ref, customer);
      }
    });

    customerBatch.commit()
      .catch(err => console.log('error on adding customers', err));
    
    data.map(entry => {
      entry.deleted = entry.deleted && entry.deleted == 1 ? 1 : 0;
      let nextId = Number(this.tableData.length ? this.tableData[0].hbr_id : 0) + 1;
      entry.id = !isNaN(entry.id) ? Number(entry.id) : this._utils.getId(this.tableData);
      if(entry.id ==0) entry.id++;
      entry.hbr_id = !isNaN(entry.hbr_id) ? Number(entry.hbr_id) : null;
      entry.box_qty = !isNaN(entry.box_qty) ? Number(entry.box_qty) : null;
      entry.initial_qty = Number(entry.initial_qty) === 0 ? entry.box_qty : Number(entry.initial_qty);
      entry.delivered = !isNaN(entry.box_qty) && entry.box_qty > 0 ? 0 : 1;
      entry.profit = !isNaN(entry.profit) ? Number(entry.profit) : null;
      entry.total_weight = !isNaN(entry.total_weight) ? Number(entry.total_weight) : null;
      entry.customer = entry.customer && entry.customer.length ? this.capitalizeText(entry.customer) : null;
      entry.warehouse = entry.warehouse && entry.warehouse.length ? this.capitalizeText(entry.warehouse) : null;
      entry.date = entry.date && this.moment(entry.date, 'DD-MM-YYYY').isValid() ? this.moment(entry.date).unix() : null;
      entry.entry_point = {name: entry.warehouse, id: entry.wh_id};
      entry.dest_type = entry.dest_type && entry.dest_type.length ? entry.dest_type : "Warehouse";

      entry.received_date = entry.received_date ? this.moment(entry.received_date).unix() : null;
      entry.shipping_date = entry.shipping_date ? this.moment(entry.shipping_date).unix() : null;
      if (!entry.hbr_id) {
        if (this.tableData.length) {
          entry.hbr_id = nextId;
          nextId = nextId + 1;
        } else {
          entry.hbr_id = 1;
        }
      }
      this.tableData.push(entry);
    });
    const chunks = data.map((e, i) => i % chunk_size === 0 ? data.slice(i, i + chunk_size) : null).filter(e => e);
    chunks.map(chunk => {
      const batch = this._db.firestore.batch();
      chunk.map(row => {
        row.checked = false;
          const ref = this._db.collection('operations').doc(`${row.id}`).ref;
          batch.set(ref, row);
      });
      promiseArr.push(batch.commit());
    });
    this.isMakingChangesOnData = true;

    Promise.all(promiseArr).then(() => {
        this.infoService.showMessage(`
        <ul>
          <li><p>Getting data... Finished </p></li>
          <li><p>Preparing data... Finished </p></li>
          <li><p>Updating ${data.length} new entries... Finished</p></li>
        </ul>
        `);
        this.finishProccesing();
        this.isMakingChangesOnData = true;
      })
      .catch(res => console.log(res));
  }

  finishProccesing = () => {
    this.fileUploader = '';
    setTimeout(this.infoService.hideMessage, 3000);
  }

  capitalizeText = (text) => {
    if (text !== null && text !== undefined && typeof text === 'string') {
      return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })).join(' ');
    }
  }

  download = () => {
    const today = this.moment().format('DD_MM_YYYY');
    let ordered = JSON.parse(JSON.stringify(this.tableData));
    ordered.map(row => {
      delete row.checked;
      delete row.entry_point;
      delete row.id;
      delete row.WR0;
      row.date = row.date ? this.moment.unix(row.date).format('DD-MM-YYYY') : null;
      row.received_date = row.received_date ? this.moment.unix(row.received_date).format('DD-MM-YYYY') : null;
        delete row.update;
        delete row.salido;
    });

    ordered = ordered.filter(row => row.deleted === 0 && row.delivered === 0);

    const worksheet: any = XLSX.utils.json_to_sheet(ordered.sort((row1, row2) => Number(row1.hbr_id) - Number(row2.hbr_id)), {
      header: [
        'update',
        'hbr_id',
        'wr0',
        'tracking',
        'customer_id',
        'customer',
        'date',
        'wh_id',
        'warehouse',
        'box_qty',
        'total_weight',
        'profit',
        'destination',
        'shipping_date',
        'delivered',
        'contact_name',
        'cuit',
        'email',
        'tel',
        'address',
        'city',
        'country',
        'description',
      ]
    });

    const workbook: any = { Sheets: { 'stock': worksheet }, SheetNames: ['stock'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    saveAs(new Blob([this.s2ab(excelBuffer)], { type: 'application/octet-stream' }), `hbr_stock_${today}.xlsx`);
  }

  s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  onEditRow = (row = {}, title = 'Edit') => {
    this._dialog.open(EditStockDialogComponent, {
      data: {
        row: row,
        warehouses: this.warehouses,
        customers: this.customers,
        couriers: this.couriers,
        title: `${title} Operation`,
        confirmBtn: title,
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
    .afterClosed().subscribe(() =>{
      this.tableData.map(row => row.checked = false);
      this.markedRows = [];
    });
  }

  onDeleteRow = (row) => {
    this._dialog.open(DeleteStockDialogComponent, {
      data: {
        row: row,
        title: 'Delete Operation',
        confirmBtn: 'Delete',
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
    .afterClosed().subscribe(() =>{
      this.tableData.map(row => row.checked = false);
      this.markedRows = [];
    });
  }

  onSendRow = (row) => {
    this._dialog.open(SendStockDialogComponent, {
      data: {
        row: row,
        warehouses: this.warehouses,
        customers: this.customers,
        couriers: this.couriers,
        title: 'Send Boxes',
        confirmBtn: 'Send',
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
    .afterClosed().subscribe(() =>{
      this.tableData.map(row => row.checked = false);
      this.markedRows = [];
    });
  }

  onDeleteAllRows = (rows) => {
    this._dialog.open(DeleteStockDialogComponent, {
      data: {
        rows: rows,
        title: 'Delete Operation',
        confirmBtn: 'Delete',
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
    .afterClosed().subscribe(() =>{
      this.tableData.map(row => row.checked = false);
      this.markedRows = [];
    });
  }

  onSendAllRows = (rows) => {
    this._dialog.open(SendStockDialogComponent, {
      data: {
        rows: rows,
        warehouses: this.warehouses,
        customers: this.customers,
        couriers: this.couriers,
        title: 'Send Boxes',
        confirmBtn: 'Send',
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
    .afterClosed().subscribe(() =>{
      this.tableData.map(row => row.checked = false);
      this.markedRows = [];
    });
  }

  onMarkedRowEvent = (row) => {
    let index = this.markedRows.findIndex(mr => mr.id === row.id);
    if (index > -1) {
      this.markedRows.splice(index, 1);
    } else {
      this.markedRows.push(row);
    }
  }
}
