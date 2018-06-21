import { CourierDialogComponent } from './edit/edit.component';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { TableService } from '../../shared/hbr-table/table.service';
import { MatDialog } from '@angular/material';
import { DeleteCourierDialogComponent } from './delete/delete.component';

@Component({
  selector: 'app-couriers',
  templateUrl: './couriers.component.html',
  styleUrls: ['./couriers.component.scss']
})
export class CouriersComponent implements OnInit {
  loadingData = false;
  data;
  cols = [
    { columnDef: 'actions', header: 'Actions', type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'Id', type: '', cell: (element) => `${element.id}` },
    { columnDef: 'name', header: 'Name', type: '', cell: (element) => `${element.name ? element.name : ''}` }
  ];
  constructor(private _db: AngularFirestore, private tbService: TableService, private _dialog: MatDialog) { }

  ngOnInit() {
    this._db.collection('couriers', ref => ref.orderBy('id', 'asc'))
      .valueChanges()
      .subscribe(data => {
        this.data = data.filter(row => row['deleted'] ? (row['deleted'] == 0 ? row : null ) : row);
        this.data.map(row => row.name = this.capitalizeText(row.name));
        this.tbService.dataSubject.next(this.data);
      });
  }

  onEditRow = (row = {}, title = 'Edit') => {
    this._dialog.open(CourierDialogComponent, {
      data: {
        row: row,
        title: `${title} Courier`,
        confirmBtn: title,
        cancelBtn: 'Cancel'
      }, width: '500px'
    });
  }

  onDeleteRow = (row) => {
    this._dialog.open(DeleteCourierDialogComponent, {
      data: {
        row: row,
        title: 'Delete Courier',
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
