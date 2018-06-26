import { DataService } from './../../shared/data.service';
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
  data = [];
  cols = [
    { columnDef: 'actions', header: 'Actions', showEdit: true, showDelete: true, type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'Id', type: '', cell: (element) => `${element.id}` },
    { columnDef: 'name', header: 'Name', type: '', cell: (element) => `${element.name ? element.name : ''}` }
  ];
  constructor(private _db: AngularFirestore,
    private tbService: TableService,
    private _dataService: DataService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this.data = this._dataService.getCouriers();
    if(!this.data.length) {
      this.loadingData = true;
    }
    this._dataService.couriersSubject.subscribe(data => {
        if(!data.length) {
          this.loadingData = false;
        } else {
          this.getData(data);
        }
      });

      if(this.data.length) {
        this.getData(this.data);
      }
  }

  getData = (data) => {
    this.data = data.filter(row => row['deleted'] ? (row['deleted'] == 0 ? row : null ) : row);
    this.data.map(row => row.name = this.capitalizeText(row.name));
    this.loadingData = false;
    this.tbService.dataSubject.next(this.data);
  }

  onEditRow = (row = {}, title = 'Edit') => {
    this._dialog.open(CourierDialogComponent, {
      data: {
        row: row,
        couriers: this.data,
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
