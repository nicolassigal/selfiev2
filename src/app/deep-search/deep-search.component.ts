import { SidenavService } from './../app-sidenav/sidenav.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { take } from 'rxjs/operators';
import { DataService } from '../shared/data.service';
import { Router, ActivatedRoute } from '@angular/router';

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
  queryText : any = '';
  searched = false;
  stock = [];
  delivered = [];
  transit = [];

  stockData = [];
  awbsData = [];
  deliveredData = [];
  constructor(
    private _sidenav: SidenavService,
    private _data: DataService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: DataService
  ) { }

  ngOnInit() {
    this._sidenav.setTitle('Deep Search');
    this._route.params.subscribe(data => {
      this.searched = false;
      let param = this.deepSearchParams.filter(param => param.query === data.query)[0];
      if (param) {
        this.setDeepSearchQueryParam(param);
      }
      this.queryText = data.id;
      if (data.query && data.id) {
        this.queryParam = data.query;
        this.queryText = Number(data.id);
        this.getData();
      }
    });
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
      let {query, id} = this._route.snapshot.params;
      if(this.queryParam !== query && Number(this.queryText) !== Number(id)){
      this._router.navigateByUrl(`/dashboard/deep-search/${this.queryParam}/${this.queryText}`);
      } else {
        this.getData();
      }
    }
  }

  getData = () => {
    let stock = this.stockData.length ? this.stockData : this._data.getStock();
    let delivered = this.deliveredData.length ? this.deliveredData : this._data.getDelivered();
    let awbs = this.awbsData.length ? this.awbsData : this._data.getAwbs();
    let id = Number(this.queryText);
    this._dataService.stockSubject.subscribe(data => stock = data)
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
    this.searched = true;
  }
}
