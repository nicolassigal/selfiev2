import { Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ShippingService } from '../shipping.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class TableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input('datasrc') datasrc;
  isMobile;
  dataSource: MatTableDataSource<Operation>;

  constructor(private _shippingService: ShippingService){}
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
    this.dataSource = new MatTableDataSource(this.datasrc);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this._shippingService.filterSubject.subscribe(data => this.applyFilter(data));
  }

  applyFilter(data) {
    this.dataSource.filter = data.trim().toLowerCase();
  }
}

export interface Operation {
  hbr_id: string;
  warehouse: string;
  box_qty: string;
  courier: string;
  customer: string;
  date: string;
  description: string;
  destination: string;
  proforma: string;
  shipping_date: string;
  total_value: string;
  total_weight: string;
  tracking: string;
}
