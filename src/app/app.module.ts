import { FirstLoginDialogComponent } from './dashboard/first-login/firstLogin.dialog';
import { DeleteTransitDialogComponent } from './transit/dialogs/delete/delete.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { HttpModule } from '@angular/http';
import { MaterialModule } from './app-material';
import { LayoutModule } from '@angular/cdk/layout';
import { AppSidenavComponent } from './app-sidenav/app-sidenav.component';
import { StockComponent } from './stock/stock.component';
import { InfoComponent } from './info/info.component';
import { InfoService } from './info/info.service';
import { HbrTableComponent } from './shared/hbr-table/hbr-table.component';
import { TableService } from './shared/hbr-table/table.service';
import { DeliveredComponent } from './delivered/delivered.component';
import { TransitComponent } from './transit/transit.component';
import { EditStockDialogComponent } from './stock/dialogs/edit-stock/edit-stock.component';
import { SendStockDialogComponent } from './stock/dialogs/send-stock/send-stock.component';
import { ReceivedStockDialogComponent } from './transit/dialogs/received/received.component';
import { EditTransitDialogComponent } from './transit/dialogs/edit/edit.component';
import { DeleteStockDialogComponent } from './stock/dialogs/delete/delete.component';
import { ExpandTransitDialogComponent } from './transit/dialogs/expand/expand.component';
import { SearchBoxComponent } from './shared/search-box/search-box.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './shared/auth.guard';
import { AuthService } from './shared/auth.service';
import { UsersComponent } from './manager/users/users.component';
import { UserDialogComponent } from './manager/users/dialogs/edit/edit.component';
import { WarehousesComponent } from './manager/warehouses/warehouses.component';
import { CouriersComponent } from './manager/couriers/couriers.component';
import { UtilsService } from './shared/utils.service';
import { DeleteUserDialogComponent } from './manager/users/dialogs/delete/delete.component';
import { CourierDialogComponent } from './manager/couriers/edit/edit.component';
import { DeleteCourierDialogComponent } from './manager/couriers/delete/delete.component';
import { WarehouseDialogComponent } from './manager/warehouses/edit/edit.component';
import { DeleteWarehouseDialogComponent } from './manager/warehouses/delete/delete.component';
import { DataService } from './shared/data.service';
import { EmptyTableComponent } from './shared/empty-table/empty-table.component';
import { ChartsModule } from 'ng2-charts';
import { WHOverviewComponent } from './manager/warehouses/overview/overview.component';
import { SidenavService } from './app-sidenav/sidenav.service';

@NgModule({
  declarations: [
    AppComponent,
    AppSidenavComponent,
    StockComponent,
    InfoComponent,
    HbrTableComponent,
    DeliveredComponent,
    TransitComponent,
    EditStockDialogComponent,
    SendStockDialogComponent,
    ReceivedStockDialogComponent,
    EditTransitDialogComponent,
    DeleteStockDialogComponent,
    DeleteTransitDialogComponent,
    ExpandTransitDialogComponent,
    SearchBoxComponent,
    SpinnerComponent,
    LoginComponent,
    DashboardComponent,
    UsersComponent,
    WarehousesComponent,
    CouriersComponent,
    UserDialogComponent,
    DeleteUserDialogComponent,
    CourierDialogComponent,
    DeleteCourierDialogComponent,
    WarehouseDialogComponent,
    DeleteWarehouseDialogComponent,
    EmptyTableComponent,
    FirstLoginDialogComponent,
    WHOverviewComponent
  ],
  imports: [
BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    LayoutModule,
    ChartsModule
  ],
  providers: [
    InfoService,
    TableService,
    AuthGuard,
    AuthService,
    UtilsService,
    DataService,
    SidenavService
  ],
  entryComponents: [
    EditStockDialogComponent,
    SendStockDialogComponent,
    ReceivedStockDialogComponent,
    EditTransitDialogComponent,
    DeleteStockDialogComponent,
    DeleteTransitDialogComponent,
    ExpandTransitDialogComponent,
    UserDialogComponent,
    DeleteUserDialogComponent,
    CourierDialogComponent,
    DeleteCourierDialogComponent,
    WarehouseDialogComponent,
    DeleteWarehouseDialogComponent,
    FirstLoginDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
