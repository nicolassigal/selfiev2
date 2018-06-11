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
    'actions',
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
    this.generateDataSource(this.datasrc);
    this._shippingService.dataSubject.subscribe(data => this.generateDataSource(data));
    this._shippingService.filterSubject.subscribe(query => this.applyFilter(query));
  }

  generateDataSource = (ds) => {
    this.dataSource = new MatTableDataSource(ds);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
