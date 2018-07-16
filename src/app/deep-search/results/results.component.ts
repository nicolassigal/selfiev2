import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  @Input('data') data;
  @Input('title') title;
  @Input('route') route;
  constructor(
    private _router: Router
  ) { }

  ngOnInit() {
  }

  navigateTo = (res) => {
    if (this.route !== 'transit') {
      this._router.navigate([`dashboard/${this.route}/${res['hbr_id']}`]);
    } else {
      this._router.navigate([`dashboard/${this.route}/${res['awb_id']}`]);
    }
  }
}
