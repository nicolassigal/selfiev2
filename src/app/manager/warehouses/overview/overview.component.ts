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
  profit = 0;
  total_weight = 0;
  chartOptions: any;
  constructor(private _dataService: DataService,
    private _sidenav: SidenavService) { }

  ngOnInit() {
    this._sidenav.setTitle('Warehouses Overview');
    this.warehouses = this._dataService.getWarehouses();
    this.warehouses = this.filterWharehouses(this.warehouses);
    this._dataService.warehouseSubject
    .pipe(takeUntil(componentDestroyed(this)))
    .subscribe(warehouses => {
      this.warehouses = this.filterWharehouses(warehouses);
      this.getData();
    });
    if (this.warehouses.length) {
      this.getData();
    }
  }

  filterWharehouses = (warehouses) => {
    const whs = warehouses.filter(warehouse => warehouse.box_qty > 0 ? warehouse : null);
    return whs;
  }

  ngOnDestroy() {
  }

  getData = () => {
    if (this.warehouses.length) {
        this.warehouses.map(wh => {
          this.warehousesLabel.push(wh.name);
          this.qtyChartData.push(wh.box_qty);
          this.valueChartData.push(wh.profit.toFixed(2));
          this.weightChartData.push(wh.total_weight);
          if (!isNaN(Number(wh.box_qty))) {
            this.total_qty = Number(this.total_qty) + Number(wh.box_qty);
          }
          if (!isNaN(Number(wh.profit))) {
            this.profit = Number(this.profit) + Number(wh.profit);
          }
          if (!isNaN(Number(wh.total_weight))) {
            this.total_weight = Number(this.total_weight) + Number(wh.total_weight);
          }
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
