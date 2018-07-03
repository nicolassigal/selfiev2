import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../shared/data.service';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from 'ng2-rx-componentdestroyed';
import { SidenavService } from '../../../app-sidenav/sidenav.service';
import 'chart.piecelabel.js';
@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class WHOverviewComponent implements OnInit, OnDestroy {
  warehouses = [];
  warehousesLabel: string[] = [];
  qtyChartData: number[] = [];
  valueChartData: number[] = [];
  weightChartData: number[] = [];
  total_qty = 0;
  total_value = 0;
  total_weight = 0;
  chartOptions: any;
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

          this.total_qty = Number(this.total_qty) + Number(wh.box_qty);
          this.total_value = Number(this.total_value) + Number(wh.total_value);
          this.total_weight = Number(this.total_weight) + Number(wh.total_weight);
        });
        this.chartOptions = {
          pieceLabel: {
          render: 'value',
          precision: 0,
          fontSize: 12,
          fontColor: '#fff',
          textShadow: true
        }
      };
    }
  }
}
