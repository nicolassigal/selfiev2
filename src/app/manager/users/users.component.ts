import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { TableService } from '../../shared/hbr-table/table.service';
import { MatDialog } from '@angular/material';
import { UserDialogComponent } from './dialogs/edit/edit.component'
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
  ];
  constructor(private _db: AngularFirestore, private tbService: TableService, private _dialog: MatDialog) { }

  ngOnInit() {
    this._db.collection('roles', ref => ref.orderBy('id', 'asc'))
    .valueChanges().subscribe(roles => this.roles = roles);
    this._db.collection('users', ref => ref.orderBy('id', 'asc'))
      .valueChanges()
      .subscribe(data => {
        this.data = data;
        this.data.map(row => {
          row.name = this.capitalizeText(row.name);
          row.role_name = this.roles.filter(role => role.id === row.role)[0].name;
        });
        this.tbService.dataSubject.next(this.data);
      });
  }

  onEditRow = (row = {}, title = 'Edit User') => {
    this._dialog.open(UserDialogComponent, {
      data: {
        row: row,
        title: title,
        confirmBtn: 'Edit',
        cancelBtn: 'Cancel'
      }, width: '500px'
    });
}

  capitalizeText = (text) => {
    if (text !== null && text !== undefined && typeof text === 'string') {
      return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })).join(' ');
    }
  }
}
