import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockComponent } from './stock/stock.component';
import { TransitComponent } from './transit/transit.component';
import { DeliveredComponent } from './delivered/delivered.component';

const routes: Routes = [
  { path: 'stock', component: StockComponent },
  { path: 'delivered', component: DeliveredComponent },
  { path: 'transit', component: TransitComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
exports: [RouterModule]
})
export class AppRoutingModule { }
