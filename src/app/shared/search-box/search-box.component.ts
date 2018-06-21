import { TableService } from './../hbr-table/table.service';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {
  query = '';
  isFiltering = false;
  constructor(private _tableService: TableService,
  private router: Router) { }

  ngOnInit() {
    this.router.events
    .pipe(filter(e => e instanceof ActivationEnd))
    .subscribe(e => this.clear());

    this._tableService.dataSubject.subscribe(() => this.clear());
  }

  clear = () => {
    this.query = '';
    this.isFiltering = false;
    this._tableService.filterSubject.next(this.query);
  }

  filterData = (query) => {
    this.query = query;
    if (query.length) {
      this.isFiltering = true;
      this._tableService.filterSubject.next(query);
    } else {
      this.isFiltering = false;
    }
  }
}
