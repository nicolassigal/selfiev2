import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../shared/data.service';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from 'ng2-rx-componentdestroyed';
import { SidenavService } from '../../../app-sidenav/sidenav.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class WHOverviewComponent implements OnInit, OnDestroy {
  public doughnutChartLabels: string[] = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
  public doughnutChartData: number[] = [350, 450, 100];
  warehouses = [];
  warehousesLabel: string[] = [];
  qtyChartData: number[] = [];
  valueChartData: number[] = [];
  weightChartData: number[] = [];
  constructor(private _dataService: DataService,
    private _sidenav: SidenavService) { }

  ngOnInit() {
    this._sidenav.setTitle('Warehouses Overview');
    this.warehouses = this._dataService.getWarehouses();
    this._dataService.warehouseSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(warehouses => {
      this.warehouses = warehouses;
      this.getData();
    });
    if (this.warehouses.length) {
      this.getData();
    }
  }

  ngOnDestroy() {
  }

  getData = () => {
    console.log(this.warehouses);
    if (this.warehouses.length) {
        this.warehouses.map(wh => {
          this.warehousesLabel.push(wh.name);
          this.qtyChartData.push(wh.box_qty);
          this.valueChartData.push(wh.total_value);
          this.weightChartData.push(wh.total_weight);
        });
    }
  }
}
