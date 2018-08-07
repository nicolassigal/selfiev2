import { DataService } from './../../shared/data.service';
import { CourierDialogComponent } from './edit/edit.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { TableService } from '../../shared/hbr-table/table.service';
import { MatDialog } from '@angular/material';
import { DeleteCourierDialogComponent } from './delete/delete.component';
import { take, takeUntil } from 'rxjs/operators';
import { componentDestroyed } from 'ng2-rx-componentdestroyed';
import { SidenavService } from '../../app-sidenav/sidenav.service';

@Component({
  selector: 'app-couriers',
  templateUrl: './couriers.component.html',
  styleUrls: ['./couriers.component.scss']
})
export class CouriersComponent implements OnInit, OnDestroy {
  loadingData = false;
  tableData = [];
  cols = [
    { columnDef: 'actions', header: 'Actions', showEdit: true, showDelete: true, type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'Cour. ID', type: '', cell: (element) => `${element.id}` },
    { columnDef: 'name', header: 'Name', type: '', cell: (element) => `${element.name ? element.name : ''}` }
  ];
  constructor(private _db: AngularFirestore,
    private tbService: TableService,
    private _dataService: DataService,
    private _sidenav: SidenavService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this._sidenav.setTitle('Manage Couriers');
    this.tableData = this._dataService.getCouriers();
    if (!this.tableData.length) {
      this.loadingData = true;
    }
    this._dataService.couriersSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(data => {
        this.tableData = data;
          this.getData(this.tableData);
    });

    this.getData(this.tableData);
  }

  ngOnDestroy() {}

  getData = (data) => {
    data = data.filter(row => row['deleted'] ? (row['deleted'] == 0 ? row : null ) : row);
    data.map(row => row.name = this.capitalizeText(row.name));
    this.loadingData = false;
    this.tableData = data;
  }

  onEditRow = (row = {}, title = 'Edit') => {
    this._dialog.open(CourierDialogComponent, {
      data: {
        row: row,
        couriers: this.tableData,
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
