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
import { ShippingComponent } from './stock/stock.component';
import { InfoComponent } from './info/info.component';
import { InfoService } from './info/info.service';
import { HbrTableComponent } from './shared/hbr-table/hbr-table.component';
import { TableService } from './shared/hbr-table/table.service';
import { DeliveredComponent } from './delivered/delivered.component';
import { TransitComponent } from './transit/transit.component';

@NgModule({
  declarations: [
    AppComponent,
    AppSidenavComponent,
    ShippingComponent,
    InfoComponent,
    HbrTableComponent,
    DeliveredComponent,
    TransitComponent
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
  bootstrap: [AppComponent]
})
export class AppModule { }
