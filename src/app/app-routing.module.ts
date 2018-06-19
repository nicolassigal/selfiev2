import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockComponent } from './stock/stock.component';
import { TransitComponent } from './transit/transit.component';
import { DeliveredComponent } from './delivered/delivered.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './shared/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Hbr Selfie' }},   
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    children: [
      { path: 'stock', component: StockComponent, data: { title: 'Stock' }},
      { path: 'delivered', component: DeliveredComponent, data: { title: 'Delivered' }},
      { path: 'transit', component: TransitComponent, data: { title: 'In Transit' }}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
exports: [RouterModule]
})
export class AppRoutingModule { }
