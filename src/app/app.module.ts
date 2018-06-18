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
    DeleteTransitDialogComponent
  ],
  imports: [
  BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    LayoutModule
  ],
  providers: [
    InfoService,
    TableService
  ],
  entryComponents: [
    EditStockDialogComponent,
    SendStockDialogComponent,
    ReceivedStockDialogComponent,
    EditTransitDialogComponent,
    DeleteStockDialogComponent,
    DeleteTransitDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
