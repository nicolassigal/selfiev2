import { DataService } from './../../shared/data.service';
import { TableService } from './../../shared/hbr-table/table.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { MatDialog } from '@angular/material';
import { UserDialogComponent } from './dialogs/edit/edit.component'
import { DeleteUserDialogComponent } from './dialogs/delete/delete.component';
import { take, takeUntil } from 'rxjs/operators';
import { componentDestroyed } from 'ng2-rx-componentdestroyed';
import { Router } from '@angular/router';
import { SidenavService } from '../../app-sidenav/sidenav.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as _moment from 'moment';
import { WorkersService } from 'src/app/workers.service';
import { InfoService } from 'src/app/info/info.service';
import { UtilsService } from '../../shared/utils.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  loadingData = false;
  moment = _moment;
  data = [];
  tableData = [];
  fileUploader = '';
  roles = [];
  warehouses = [];
  cols = [
    { columnDef: 'actions', header: 'Actions', showEdit: true, showDelete: true, showStockRoom: true, type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'User ID', type: '', cell: (element) => `${element.id}` },
    { columnDef: 'name', header: 'Name', type: '', cell: (element) => `${element.name ? element.name : ''}` },
    { columnDef: 'tel', header: 'Phone', type: '', cell: (element) => `${element.tel ? element.tel : ''}` },
    { columnDef: 'address', header: 'Address', type: '', cell: (element) => `${element.address ? element.address : ''}` },
    { columnDef: 'city', header: 'City', type: '', cell: (element) => `${element.city ? element.city : ''}` },
    { columnDef: 'country', header: 'Country', type: '', cell: (element) => `${element.country ? element.country : ''}` },
    { columnDef: 'cuit', header: 'Cuit', type: '', cell: (element) => `${element.cuit ? element.cuit : ''}` },
    { columnDef: 'username', header: 'Username', type: '', cell: (element) => `${element.username ? element.username : ''}` },
    { columnDef: 'role_name', header: 'Role', type: '', cell: (element) => `${element.role_name ? element.role_name : ''}` },
    { columnDef: 'wh_name', header: 'Wh', type: '', cell: (element) => `${element.wh_name ? element.wh_name : ''}` },
  ];
  constructor(private _db: AngularFirestore,
    private _worker: WorkersService,
    private infoService: InfoService,
    private tbService: TableService,
    private _dataService: DataService,
    private _router: Router,
    private _sidenav: SidenavService,
    private _utils: UtilsService,
    private _authService: AuthService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this._sidenav.setTitle('Manage Users');
    this.tableData = this._dataService.getCustomers();
    this.warehouses = this._dataService.getWarehouses();
    this.roles = this._dataService.getRoles();
    if (!this.tableData.length) {
      this.loadingData = true;
    }
    this._dataService.warehouseSubject
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(warehouses => this.warehouses = warehouses);
    this._dataService.customerSubject
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(customers => {
        this.tableData = customers;
        this.filterData(this.tableData);
      });

    if (!this.roles.length) {
      this._dataService.rolesSubject
        .pipe(takeUntil(componentDestroyed(this)))
        .subscribe(roles => {
          this.roles = roles;
          this.filterData(this.tableData);
        });
    } else {
      this.filterData(this.tableData);
    }
  }

  ngOnDestroy() { }

  filterData = (data) => {
    data = data.sort((a, b) => a.name.localeCompare(b.name));
    data = data.filter(row => row['deleted'] ? (row['deleted'] == 0 ? row : null) : row);
    data.map(row => {
      row.name = this.capitalizeText(row.name);
      const rowRole = row.role || 0;
      const role = this.roles.filter(role => role['id'] == rowRole)[0];
      row.role_name = role && role.name ? role.name : null;
      const wh_id = row.wh_id || null;
      row.warehouse = wh_id ? this.warehouses.filter(wh => wh['id'] == wh_id)[0] :  null;
      row.wh_name = row.warehouse ? row.warehouse['name'] : null;
    });
    this.loadingData = false;
    this.tableData = data;
  }

  navigateToOverview = () => {
    this._router.navigate(['dashboard/user-overview']);
  }

  onEditRow = (row = {}, title = 'Edit') => {
    this._dialog.open(UserDialogComponent, {
      data: {
        row: row,
        roles: this.roles,
        warehouses: this.warehouses,
        users: this.tableData,
        title: `${title} User`,
        confirmBtn: title,
        cancelBtn: 'Cancel'
      }, width: '500px'
    });
  }

  onDeleteRow = (row) => {
    this._dialog.open(DeleteUserDialogComponent, {
      data: {
        row: row,
        title: 'Delete user',
        confirmBtn: 'Delete',
        cancelBtn: 'Cancel'
      }, width: '500px'
    });
  }

  onStockRoomEvent = (row) => {
    this._router.navigate([`/dashboard/users/${row.id}/stock`]);
  }

  capitalizeText = (text) => {
    if (text !== null && text !== undefined && typeof text === 'string') {
      return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })).join(' ');
    }
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
    const msgToWorker = { msg: 'Start Worker', xlsData: xls, dbData: data };
    this.infoService.showMessage(`
    <ul>
      <li><p>Getting data... Finished </p></li>
      <li><p>Preparing data... Please wait </p></li>
    </ul>
    `);

    this._worker.createWorker(this._worker.getWorkerbyId());
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
    console.log('DATA', data);
    const customerBatch = this._db.firestore.batch();
    const chunk_size = 250;
    this.infoService.showMessage(`
    <ul>
      <li><p>Getting data... Finished </p></li>
      <li><p>Preparing data... Finished </p></li>
      <li><p>Updating ${data.length} new entries... please wait </p></li>
    </ul>
    `);

    data.map(customer => {
      if (customer) {
        const updateUsernameArray = [];
        const tbDataCustomer = this.tableData.filter(cs => cs.id === customer.id)[0];
        if (customer.update) {
          customer = {
            ...tbDataCustomer,
            ...customer
          };
        }
        customer.id = customer.id ? customer.id : this._utils.getId(this.tableData);
        customer.username = customer.username ? customer.username : `username_${customer.id}@tucourier.com.ar`;
        customer.email = customer.username;
        if (!customer.update) {
          customer.password = `password_${customer.id}`;
        }
        customer.changed_pwd = customer.changed_pwd ? true : false;
        customer.role = customer.role ? customer.role : 0;
        if (customer.update && !customer.updatedInfo) {
          customer.updatedInfo = false;
        }
        if (!customer.update) {
          this._authService._addUser(customer.username, customer.password).subscribe();
        }
        if (customer.update && tbDataCustomer && tbDataCustomer.username !== customer.username) {
          updateUsernameArray.push(this._authService.updateUsername(tbDataCustomer.username, customer.username, tbDataCustomer.password));
        }

        const ref = this._db.collection('users').doc(`${customer.id}`).ref;
        customerBatch.set(ref, customer);

        if (updateUsernameArray.length) {
          Promise.all(updateUsernameArray)
          .then(res => console.log(res))
          .catch(err => console.log(err));
        }
      }
    });

    customerBatch.commit().then(res => {
      this.infoService.showMessage(`
      <ul>
        <li><p>Getting data... Finished </p></li>
        <li><p>Preparing data... Finished </p></li>
        <li><p>Updating ${data.length} new entries... Finished</p></li>
      </ul>
      `);
      this.finishProccesing();
    });
  }

  finishProccesing = () => {
    this.fileUploader = '';
    setTimeout(this.infoService.hideMessage, 3000);
  }

  updateAndDownload = () => {
    this._db.collection('users', ref => ref.orderBy('name', 'asc'))
    .valueChanges()
    .pipe(take(1))
    .subscribe(customers => {
      // localStorage.setItem('users', JSON.stringify(customers));
      customers = customers.filter(customer => !customer['deleted'] || customer['deleted'] !== 1);
      this._dataService.setCustomers(customers);
      this.download();
    });
  }

  download = () => {
    const users = JSON.parse(JSON.stringify(this.tableData));
    users.map(user => {
      delete user.password;
      delete user.changed_pwd;
      delete user.updatedInfo;
      delete user.ask_change_pwd;
      delete user.ask_change_info;
      delete user.updated_info;
      delete user.update;
    });
    const today = this.moment().format('DD_MM_YYYY');
    const worksheet: any = XLSX.utils.json_to_sheet(users.sort((row1, row2) => Number(row1.id) - Number(row2.id)), {
      header: [
        'update',
        'id',
        'name',
        'email',
        'username',
        'wh_id',
        'wh_name',
        'tel',
        'cuit',
        'address',
        'city',
        'country',
        'contact_name',
        'products',
        'role',
        'role_name',
        'ask_change_pwd',
        'ask_change_info',
        'deleted'
      ]
    });
    const workbook: any = { Sheets: { 'users': worksheet }, SheetNames: ['users'] };
    const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', bookSST: true, type: 'binary'});
    saveAs(new Blob([this.s2ab(excelBuffer)], {type: 'application/octet-stream'}), `users_${today}.xlsx`);
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
