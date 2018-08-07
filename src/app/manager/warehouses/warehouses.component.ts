import { DataService } from './../../shared/data.service';
import { DeleteWarehouseDialogComponent } from './delete/delete.component';
import { WarehouseDialogComponent } from './edit/edit.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { TableService } from '../../shared/hbr-table/table.service';
import { MatDialog } from '@angular/material';
import { take, takeUntil } from 'rxjs/operators';
import { componentDestroyed } from 'ng2-rx-componentdestroyed';
import { Router } from '@angular/router';
import { SidenavService } from '../../app-sidenav/sidenav.service';

@Component({
  selector: 'app-warehouses',
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.scss']
})
export class WarehousesComponent implements OnInit, OnDestroy {
  loadingData = false;
  tableData = [];
  operations = [];
  cols = [
    { columnDef: 'actions', header: 'Actions', showEdit: true, showDelete: true, showStockRoom: true, type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'WH ID', type: '', cell: (element) => `${element.id}` },
    { columnDef: 'name', header: 'Name', type: '', cell: (element) => `${element.name ? element.name : ''}` },
    { columnDef: 'box_qty', header: 'Total Qty.', type: '', cell: (element) => `${element.box_qty ? element.box_qty : ''}` },
    { columnDef: 'profit', header: 'Profit', type: 'value', cell: (element) => `${element.profit ? element.profit : ''}` },
    { columnDef: 'total_weight', header: 'Total Weight', type: 'weight', cell: (element) => `${element.total_weight ? element.total_weight : ''}` }
  ];
  constructor(private _db: AngularFirestore,
    private tbService: TableService,
    private _dataService: DataService,
    private _router: Router,
    private _sidenav: SidenavService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this._sidenav.setTitle('Manage Warehouses');
    this.tableData = this._dataService.getWarehouses();
    this.operations = this._dataService.getStock();

    if (!this.tableData.length) {
      this.loadingData = true;
    }

    this._dataService.warehouseSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(data => {
      this.tableData = data;
      this.filterData(this.tableData);
    });

    this._dataService.stockSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(operations => {
      this.operations = operations;
      this.filterData(this.tableData);
    });

    if (this.tableData.length) {
      this.filterData(this.tableData);
    }
  }

  ngOnDestroy () {}

  filterData = (data) => {
    const promises = [];
    data = data.filter(row => row['deleted'] ? (row['deleted'] == 0 ? row : null ) : row);
    data.map(row => {
      row.box_qty = 0;
      row.profit = 0;
      row.total_weight = 0;
      row.name = this.capitalizeText(row.name);
      let whOperations = this.operations.filter(op => Number(op.wh_id) === Number(row.id));
      if (whOperations.length) {
        whOperations.map(whOp => {
          if (whOp.box_qty > 0 && whOp.delivered == 0 && whOp.deleted == 0) {
            row.box_qty = Number(row.box_qty) + Number(whOp.box_qty);
            row.profit = Number(row.profit) + Number(whOp.profit);
            row.total_weight = Number(row.total_weight) + Number(whOp.total_weight);
          }
        });
      }
      promises.push(this._db.collection('warehouses').doc(`${row.id}`).set(row));
    });
    Promise.all(promises).then(res => {
      this.loadingData = false;
      this.tableData = data;
    });
  }

  navigateToOverview = () => {
    this._router.navigate(['dashboard/warehouses-overview']);
  }

  onEditRow = (row = {}, title = 'Edit') => {
    this._dialog.open(WarehouseDialogComponent, {
      data: {
        row: row,
        warehouses: this.tableData,
        title: `${title} Warehouse`,
        confirmBtn: title,
        cancelBtn: 'Cancel'
      }, width: '500px'
    });
  }

  onDeleteRow = (row) => {
    this._dialog.open(DeleteWarehouseDialogComponent, {
      data: {
        row: row,
        title: 'Delete Warehouse',
        confirmBtn: 'Delete',
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
  }

  onStockRoomEvent = (row) => {
    this._router.navigate([`/dashboard/warehouses/${row.id}/stock`]);
  }

  capitalizeText = (text) => {
    if (text !== null && text !== undefined && typeof text === 'string') {
      return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })).join(' ');
    }
  }

}
