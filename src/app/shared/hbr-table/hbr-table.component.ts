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
  }

  setColumns = () => {
    this.columns = this.cols;
  }

  applyFilter(data) {
    this.dataSource.filter = data.trim().toLowerCase();
  }
}
