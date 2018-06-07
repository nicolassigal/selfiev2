import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { TableDataSource } from './table-datasource';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input('datasrc') datasrc;
  dataSource: TableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    'hbr_id',
    'warehouse',
    'box_qty',
    'courier',
    'customer',
    'date',
    'description',
    'destination',
    'proforma',
    'shipping_date',
    'total_value',
    'total_weight',
    'tracking'
  ];

  ngOnInit() {
    this.dataSource = new TableDataSource(this.datasrc, this.paginator, this.sort);
  }
}
