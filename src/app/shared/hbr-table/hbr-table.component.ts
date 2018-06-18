import { Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { TableService } from './table.service';

@Component({
  selector: 'app-hbr-table',
  templateUrl: './hbr-table.component.html',
  styleUrls: ['./hbr-table.component.scss']
})

export class HbrTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input('datasrc') datasrc;
  @Input('cols') cols;
  columns;
  isMobile;
  totalizer;
  dataSource: MatTableDataSource<any>;
  displayedColumns;

  constructor(private _tableService: TableService) {}


  ngOnInit() {
    this.setColumns();
    this.generateDataSource(this.datasrc);
    this._tableService.dataSubject.subscribe(source => this.generateDataSource(source));
    this._tableService.filterSubject.subscribe(query => this.applyFilter(query));
  }

  generateDataSource = (ds) => {
    this.displayedColumns = this.columns.map(c => c.columnDef);
    this.dataSource = new MatTableDataSource(ds);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.calcTotals(this.dataSource.data);
  }

  setColumns = () => {
    this.columns = this.cols;
  }

  calcTotals = (data) => {
    this.totalizer = { weight: 0, value: 0, quantity: 0, operations: 0 };

    data.map(row => {
      this.totalizer.weight = Number(this.totalizer.weight) + Number(row.total_weight) || 0;
      this.totalizer.value = Number(this.totalizer.value) + Number(row.total_value)  || 0;
      this.totalizer.quantity = Number(this.totalizer.quantity) + Number(row.box_qty)  || 0
    });

    this.totalizer.weight = this.totalizer.weight.toFixed(2);
    this.totalizer.value = this.totalizer.value.toFixed(2);
    this.totalizer.operations = data.length;
  }

  editRow = (row) => {
    this._tableService.editRowSubject.next(row);
  }

  deleteRow = (row) => {
    this._tableService.deleteRowSubject.next(row);
  }

  sendBoxes = (row) => {
    this._tableService.sendBoxesSubject.next(row);
  }

  received = (row) => {
    this._tableService.receivedBoxesSubject.next(row);
  }

  applyFilter(data) {
    this.dataSource.filter = data.trim().toLowerCase();
    this.calcTotals(this.dataSource.filteredData);
  }
}
