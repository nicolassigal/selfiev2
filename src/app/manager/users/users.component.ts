import { DataService } from './../../shared/data.service';
import { TableService } from './../../shared/hbr-table/table.service';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { MatDialog } from '@angular/material';
import { UserDialogComponent } from './dialogs/edit/edit.component'
import { take } from 'rxjs/operators';
import { DeleteUserDialogComponent } from './dialogs/delete/delete.component';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  loadingData = false;
  data = [];
  roles = [];
  warehouses = [];
  cols = [
    { columnDef: 'actions', header: 'Actions', showEdit: true, showDelete: true, type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'Id', type: '', cell: (element) => `${element.id}` },
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
    private tbService: TableService,
    private _dataService: DataService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this.data = this._dataService.getCustomers();
    this.warehouses = this._dataService.getWarehouses();
    this.roles = this._dataService.getRoles();
    if(!this.data.length) {
      this.loadingData = true;
    }
    this._dataService.warehouseSubject.subscribe(warehouses => this.warehouses = warehouses);
    this._dataService.customerSubject.subscribe(customers => {
      if(!customers.length) {
        this.loadingData = false;
      } else {
        this.filterData(customers);
      }
    });

    if(!this.roles.length) {
      this._dataService.rolesSubject.subscribe(roles => {
        this.roles = roles;
        this.getData();
      });
    } else {
      this.getData();
    }
  }

  getData = () => {
    if (!this.data.length) {
      this.loadingData = false;
    } else {
      this.filterData(this.data);
    } 
  }

  filterData = (data) => {
    this.data = data.filter(row => row['deleted'] ? (row['deleted'] == 0 ? row : null ) : row);
      
    this.data.map(row => {
      row.name = this.capitalizeText(row.name);
      let rowRole = row.role || 0;
      row.role_name = this.roles.filter(role => role['id'] === rowRole)[0]['name'];
      let wh_id = row.wh_id || null;
      row.wh_name = wh_id ? this.warehouses.filter(wh => wh['id'] === wh_id)[0]['name'] : null;
    });
    this.loadingData = false;
    this.tbService.dataSubject.next(this.data);
  }

  onEditRow = (row = {}, title = 'Edit') => {
    this._dialog.open(UserDialogComponent, {
      data: {
        row: row,
        roles: this.roles,
        warehouses: this.warehouses,
        users: this.data,
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
    })
}

  capitalizeText = (text) => {
    if (text !== null && text !== undefined && typeof text === 'string') {
      return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })).join(' ');
    }
  }
}
