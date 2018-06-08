import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShippingComponent } from './shipping/shipping.component';
import { AirwaybillsComponent } from './airwaybills/airwaybills.component';

const routes: Routes = [
  { path: 'shipping', component: ShippingComponent },
  { path: 'airwaybills', component: AirwaybillsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
exports: [RouterModule]
})
export class AppRoutingModule { }
