import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockComponent } from './stock/stock.component';
import { TransitComponent } from './transit/transit.component';
import { DeliveredComponent } from './delivered/delivered.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './shared/auth.guard';
import { UsersComponent } from './manager/users/users.component';
import { WarehousesComponent } from './manager/warehouses/warehouses.component';
import { CouriersComponent } from './manager/couriers/couriers.component';
const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Hbr Selfie' }},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    children: [
      { path: 'stock', component: StockComponent, data: { title: 'Stock', authLevel: [0, 1, 2] }},
      { path: 'delivered', component: DeliveredComponent, data: { title: 'Delivered',  authLevel: [0, 1, 2] }},
      { path: 'transit', component: TransitComponent, data: { title: 'In Transit', authLevel: [0, 1, 2]}},
      { path: 'users', component: UsersComponent, data: { title: 'Manage Users', authLevel: [1] }},
      { path: 'wh', component: WarehousesComponent, data: { title: 'Manage Warehouses', authLevel: [1] }},
      { path: 'couriers', component: CouriersComponent, data: { title: 'Manage Couriers', authLevel: [1] }},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
exports: [RouterModule]
})
export class AppRoutingModule { }
