import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transit',
  templateUrl: './transit.component.html',
  styleUrls: ['./transit.component.scss']
})
export class TransitComponent implements OnInit {
  loadingData = false;
  data;
  fileUploader = '';
  cols = [
    { columnDef: 'awb_id', header: 'Hbr id',    cell: (element) => `${element.hbr_id}` },
    { columnDef: 'box_qty',     header: 'Box qty.',   cell: (element) => `${element.box_qty ? element.box_qty : ''}`},
    { columnDef: 'total_weight',   header: 'Total Weight', cell: (element) =>
      `${element.total_weight ? element.total_weight  + ' Kg.' : ''}`},
    { columnDef: 'total_value',   header: 'Total Value', cell: (element) =>
      `${element.total_value ? 'U$D' + element.total_value : ''}`},
    { columnDef: 'shipping_date',   header: 'Shipping date', cell: (element) => `${element.shipping_date ? element.shipping_date : ''}`},
    { columnDef: 'courier',   header: 'Courier', cell: (element) => `${element.courier ? element.courier : ''}`},
    { columnDef: 'tracking',   header: 'Tracking', cell: (element) => `${element.tracking ? element.tracking : ''}`},
    { columnDef: 'destination',   header: 'Destination', cell: (element) => `${element.destination ? element.destination : ''}`}
  ];
  constructor() { }

  ngOnInit() {
  }

}
