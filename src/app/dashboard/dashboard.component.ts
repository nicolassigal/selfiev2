import { NotificationService } from './../shared/notification.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { DataService } from './../shared/data.service';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { MatDialog } from '@angular/material';
import { FirstLoginDialogComponent } from './first-login/firstLogin.dialog';
import { SidenavService } from '../app-sidenav/sidenav.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private dataService: DataService,
    private _route: ActivatedRoute,
    private _sidenavService: SidenavService,
    private _dialog: MatDialog,
    private _ns: NotificationService
  ) { }

  ngOnInit() {
    this._db.collection('users', ref => ref.orderBy('name', 'asc'))
    .valueChanges()
    .subscribe(customers => {
      this.firstLogin(customers);
      this.dataService.setCustomers(customers);
    });

    this._db.collection('operations', ref => ref
      .where('deleted', '==', 0)
      .orderBy('hbr_id', 'desc'))
    .valueChanges()
    .subscribe(stock => this.dataService.setStock(stock));

    this._db.collection('warehouses', ref => ref
    .orderBy('name', 'asc'))
    .valueChanges()
    .subscribe(warehouses => {
      warehouses = warehouses.filter(warehouse => !warehouse['deleted'] || warehouse['deleted'] !== 1);
      this.dataService.setWarehouses(warehouses);
    });

    this._db.collection('couriers', ref => ref
    .where('deleted', '==', 0)
    .orderBy('name', 'asc'))
    .valueChanges()
    .subscribe(couriers => this.dataService.setCouriers(couriers));

    this._db.collection('awbs', ref => ref
    .orderBy('id', 'asc'))
    .valueChanges()
    .subscribe(awbs => {
      awbs = awbs.filter(awb => !awb['deleted'] || awb['deleted'] !== 1);
      this.dataService.setAwbs(awbs);
    });

    this._db.collection('delivered', ref => ref
    .where('deleted', '==', 0)
    .orderBy('hbr_id', 'desc'))
    .valueChanges()
    .subscribe(delivered => this.dataService.setDelivered(delivered));

    this._db.collection('status')
    .valueChanges()
    .subscribe(status => this.dataService.setStatus(status));

    this._db.collection('roles')
    .valueChanges()
    .subscribe(roles => this.dataService.setRoles(roles));
  }

  firstLogin = (users) => {
    const email = this._auth.auth.currentUser.email;
    const existingUser = users.filter(user => user.username === email)[0];
    if (existingUser && !existingUser.updatedInfo) {
      this._dialog.open(FirstLoginDialogComponent, {
        data: {
          user: existingUser,
          users: users,
          title: `Update your information`,
          confirmBtn: 'update',
          cancelBtn: 'Back to login'
        },
        width: '500px',
        disableClose: true
      });
    }
  }
}
