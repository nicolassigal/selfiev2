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
  data;
  roles;
  cols = [
    { columnDef: 'actions', header: 'Actions', type: '', cell: (element) => `${element.actions}` },
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
  constructor(private _db: AngularFirestore, private tbService: TableService, private _dialog: MatDialog) { }

  ngOnInit() {
    this._db.collection('users', ref => ref.orderBy('id', 'desc'))
      .valueChanges()
      .subscribe(data => {
        this.data = data.filter(row => row['deleted'] ? (row['deleted'] == 0 ? row : null ) : row);
        this._db.collection('roles', ref => ref.orderBy('id', 'asc'))
          .valueChanges()
          .pipe(take(1))
          .subscribe(roles => {
            this.data.map(row => {
              row.name = this.capitalizeText(row.name);
              let rowRole = row.role || 0;
              row.role_name = roles.filter(role => role['id'] === rowRole)[0]['name'];
            });
          });
          this._db.collection('warehouses', ref => ref.orderBy('id', 'asc'))
          .valueChanges()
          .pipe(take(1))
          .subscribe(warehouses => {
            this.data.map(row => {
              let wh_id = row.wh_id || null;
              row.wh_name = wh_id ? warehouses.filter(wh => wh['id'] === wh_id)[0]['name'] : null;
            });
          });
        this.tbService.dataSubject.next(this.data);
      });
  }

  onEditRow = (row = {}, title = 'Edit') => {
    this._dialog.open(UserDialogComponent, {
      data: {
        row: row,
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
