import { Component, OnInit, ViewChild, Input, ViewEncapsulation,
  Output, EventEmitter, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { TableService } from './table.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-hbr-table',
  templateUrl: './hbr-table.component.html',
  styleUrls: ['./hbr-table.component.scss']
})

export class HbrTableComponent implements OnInit, OnChanges, OnDestroy {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.Handset,
    Breakpoints.Tablet,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(map(result => result.matches));
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input('datasrc') datasrc;
  @Input('cols') cols;
  @Input('noTotal') noTotal;
  @Input('noProfit') noProfit;
  @Input('noTotalOperation') noTotalOperation;
  @Output() editRowEvent = new EventEmitter<{}>();
  @Output() deleteRowEvent = new EventEmitter<{}>();
  @Output() sendRowEvent = new EventEmitter<{}>();
  @Output() ReceivedRowEvent = new EventEmitter<{}>();
  @Output() expandRowDataEvent = new EventEmitter<{}>();

  columns;
  isMobile;
  totalizer;
  data = [];
  dataSource: MatTableDataSource<any>;
  displayedColumns;

  constructor(private _tableService: TableService, private breakpointObserver: BreakpointObserver) {}


  ngOnInit() {
    this.data = this.datasrc;
    this.setColumns();
    this.generateDataSource(this.data);
    this._tableService.filterSubject.subscribe(query => this.applyFilter(query));
  }

  ngOnDestroy() {
    console.log('destroyed');
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.cols = changes.cols && changes.cols.currentValue.length ? changes.cols.currentValue : this.cols;
      this.data = changes.datasrc && changes.datasrc.currentValue.length ? changes.datasrc.currentValue : [];
      this.setColumns();
      this.generateDataSource(this.data);
      this._tableService.dataChangedSubject.next(true);
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
      this.totalizer.value = Number(this.totalizer.value) + Number(row.profit)  || 0;
      this.totalizer.quantity = Number(this.totalizer.quantity) + Number(row.box_qty)  || 0
    });

    this.totalizer.weight = this.totalizer.weight.toFixed(2);
    this.totalizer.value = this.totalizer.value.toFixed(2);
    this.totalizer.operations = data.length;
  }

  editRow = (row) => {
    this.editRowEvent.emit(row);
  }

  deleteRow = (row) => {
    this.deleteRowEvent.emit(row);
  }

  sendBoxes = (row) => {
    this.sendRowEvent.emit(row);
  }

  received = (row) => {
    this.ReceivedRowEvent.emit(row);
  }

  expand = (row) => {
    this.expandRowDataEvent.emit(row);
  }

  applyFilter(data) {
    this.dataSource.filter = data.trim().toLowerCase();
    this.calcTotals(this.dataSource.filteredData);
  }
}
