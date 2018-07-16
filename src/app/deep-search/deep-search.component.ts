import { SidenavService } from './../app-sidenav/sidenav.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { take } from 'rxjs/operators';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-deep-search',
  templateUrl: './deep-search.component.html',
  styleUrls: ['./deep-search.component.scss']
})
export class DeepSearchComponent implements OnInit {

  deepSearchParams = [
    { label: 'Hbr id', query: 'hbr_id' },
    { label: 'Warehouse id', query: 'wh_id' },
    { label: 'Customer id', query: 'customer_id' },
    { label: 'Courier id', query: 'courier_id' }
  ];

  defaultLabel: string = 'Search By ...';
  queryParam : string = '';
  queryText : string = '';

  stock = [];
  delivered = [];
  transit = [];
  constructor(
    private _sidenav: SidenavService,
    private _data: DataService
  ) { }

  ngOnInit() {
    this._sidenav.setTitle('Deep Search');
  }

  setDeepSearchQueryParam = (param) => {
    this.defaultLabel = param.label;
    this.queryParam = param.query;
  }

  deepSearch = (f: NgForm) => {
    this.stock = [];
    this.delivered = [];
    this.transit = [];
    if (this.queryParam && this.queryText) {
      let id = Number(this.queryText);
      let stock = this._data.getStock();
      let delivered = this._data.getDelivered();
      let awbs = this._data.getAwbs();
      if (this.queryParam === 'hbr_id') {
        stock = stock.filter(operation => (operation[this.queryParam] == id || operation['linked_op'] == id) && operation.delivered == 0);
        this.stock.push(...stock);

        delivered = delivered.filter(delivered => delivered[this.queryParam] == id  || delivered['linked_op'] == id);
        this.delivered.push(...delivered);

        awbs = awbs.filter(awb => {
          let processes = [];
          processes = awb.processes.filter(process => process[this.queryParam] == id || process['linked_op'] == id);
          if (processes.length) {
            awb.processes = processes;
            return awb;
          }
        });
        this.transit.push(...awbs);
      } else {
        stock = stock.filter(operation => operation[this.queryParam] == id && operation.delivered == 0);
        this.stock.push(...stock);

        delivered = delivered.filter(delivered => delivered[this.queryParam] == id);
        this.delivered.push(...delivered);

        awbs.map(awb => {
          let processes = [];
          processes = awb.processes.filter(process => process[this.queryParam] == id);
          if (processes.length) {
            processes.map(process => process['awb_id'] = awb.id);
            this.transit.push(...processes);
          }
        });
        
      }
    }
    console.log(this.stock);
    console.log(this.transit);
    console.log(this.delivered);
  }
}
