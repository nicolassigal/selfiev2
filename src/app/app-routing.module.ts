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
import { WHOverviewComponent } from './manager/warehouses/overview/overview.component';
const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Hbr Selfie' }},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { authLevel: [0, 1, 2] },
    children: [
      { path: 'stock', component: StockComponent, data: { title: 'Stock', authLevel: [0, 1, 2] }},
      { path: 'delivered', component: DeliveredComponent, data: { title: 'Delivered',  authLevel: [0, 1, 2] }},
      { path: 'transit', component: TransitComponent, data: { title: 'In Transit', authLevel: [0, 1, 2]}},
      { path: 'users', component: UsersComponent, data: { title: 'Manage Users', authLevel: [2] }},
      { path: 'users/:id/stock', component: StockComponent, data: { title: 'User Stock', filter: 'users', authLevel: [2] }},
      { path: 'warehouses', component: WarehousesComponent, data: { title: 'Manage Warehouses', authLevel: [2] }},
      { path: 'warehouses/:id/stock', component: StockComponent, data: { title: 'Warehouse Stock', filter: 'warehouse', authLevel: [2] }},
      { path: 'warehouses-overview', component: WHOverviewComponent, data: { title: 'Warehouses Overview', authLevel: [2] }},
      { path: 'couriers', component: CouriersComponent, data: { title: 'Manage Couriers', authLevel: [2] }},
      { path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
exports: [RouterModule]
})
export class AppRoutingModule { }
