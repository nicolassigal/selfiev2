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
    { label: 'Customer name', query: 'customer' }
  ];

  defaultLabel: string = 'Search By ...';
  queryParam : string = '';
  queryText : any = '';
  searched = false;
  stock = [];

  stockData = [];
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
        this.queryText = data.id;
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
    if (this.queryParam && this.queryText) {
      let {query, id} = this._route.snapshot.params;
      if(this.queryParam !== query && this.queryText != id){
      this._router.navigateByUrl(`/dashboard/deep-search/${this.queryParam}/${this.queryText}`);
      } else {
        this.getData();
      }
    }
  }

  getData = () => {
    
    let stock = this.stockData.length ? this.stockData : this._data.getStock();
    let id = this.queryText;

    this._dataService.stockSubject.subscribe(data => stock = data)
    if (this.queryParam!=="customer") {
      stock = stock.filter(operation => (operation[this.queryParam] == id));
      this.stock.push(...stock);
    } else {
      stock = stock.filter(operation => (operation[this.queryParam].toLowerCase().includes(id.toLowerCase())? operation : null));
      this.stock.push(...stock);
    }

    this.searched = true;
  }
}
