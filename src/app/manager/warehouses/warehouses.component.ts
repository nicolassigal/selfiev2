import { DataService } from './../../shared/data.service';
import { DeleteWarehouseDialogComponent } from './delete/delete.component';
import { WarehouseDialogComponent } from './edit/edit.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { TableService } from '../../shared/hbr-table/table.service';
import { MatDialog } from '@angular/material';
import { take, takeUntil } from 'rxjs/operators';
import { componentDestroyed } from 'ng2-rx-componentdestroyed';

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
    { columnDef: 'actions', header: 'Actions', showEdit: true, showDelete: true, type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'Id', type: '', cell: (element) => `${element.id}` },
    { columnDef: 'name', header: 'Name', type: '', cell: (element) => `${element.name ? element.name : ''}` },
    { columnDef: 'box_qty', header: 'Total Qty.', type: '', cell: (element) => `${element.box_qty ? element.box_qty : ''}` },
    { columnDef: 'total_value', header: 'Total Val', type: 'value', cell: (element) => `${element.total_value ? element.total_value : ''}` },
    { columnDef: 'total_weight', header: 'Total Weight', type: 'weight', cell: (element) => `${element.total_weight ? element.total_weight : ''}` }
  ];
  constructor(private _db: AngularFirestore,
    private tbService: TableService,
    private _dataService: DataService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this.tableData = this._dataService.getWarehouses();
    if (!this.tableData.length) {
      this.loadingData = true;
    }
    this.operations = this._dataService.getStock();

    this._dataService.warehouseSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(data => {
      this.tableData = data;
      this.filterData(this.tableData);
    });

    if (!this.operations.length) {
      this._dataService.stockSubject
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(operations => {
        this.operations = operations;
        this.filterData(this.tableData);
      });
    } else {
      this.filterData(this.tableData);
    }
  }

  ngOnDestroy () {}

  filterData = (data) => {
    if (data.length) {
    data = data.filter(row => row['deleted'] ? (row['deleted'] == 0 ? row : null ) : row);
    data.map(row => {
      row.box_qty = 0;
      row.total_value = 0;
      row.total_weight = 0;
      row.name = this.capitalizeText(row.name);
      let whOperations = this.operations.filter(op => op.wh_id === row.id);
      if (whOperations.length) {
        whOperations.map(whOp => {
          if (whOp.box_qty > 0 && whOp.delivered == 0 && whOp.deleted == 0) {
            row.box_qty = Number(row.box_qty) + Number(whOp.box_qty);
            row.total_value = Number(row.total_value) + Number(whOp.total_value);
            row.total_weight = Number(row.total_weight) + Number(whOp.total_weight);
          }
        });
      }
    });
  }
    this.loadingData = false;
    this.tableData = data;
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

  capitalizeText = (text) => {
    if (text !== null && text !== undefined && typeof text === 'string') {
      return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })).join(' ');
    }
  }

}
