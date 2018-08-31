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
      // localStorage.setItem('users', JSON.stringify(customers));
      customers = customers.filter(customer => !customer['deleted'] || customer['deleted'] !== 1);
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
      // localStorage.setItem('warehouses', JSON.stringify(warehouses));
      warehouses = warehouses.filter(warehouse => !warehouse['deleted'] || warehouse['deleted'] !== 1);
      this.dataService.setWarehouses(warehouses);
    });

    this._db.collection('couriers', ref => ref
    .orderBy('name', 'asc'))
    .valueChanges()
    .subscribe(couriers => {
      // localStorage.setItem('couriers', JSON.stringify(couriers));
      couriers = couriers.filter(courier => !courier['deleted'] || courier['deleted'] !== 1);
      this.dataService.setCouriers(couriers);
    });

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
    .subscribe(status => {
     // localStorage.setItem('status', JSON.stringify(status));
      this.dataService.setStatus(status);
    });

    this._db.collection('roles')
    .valueChanges()
    .subscribe(roles => {
     // localStorage.setItem('roles', JSON.stringify(roles));
      this.dataService.setRoles(roles);
    });


    /*let userArray = [];
    let users = JSON.parse(localStorage.getItem('users'));
    users.map(user => userArray.push(this._db.collection('users').doc(`${user.id}`).set(user)));
    Promise.all(userArray).then(res => console.log(res));

    let whArray = [];
    let whs = JSON.parse(localStorage.getItem('warehouses'));
    whs.map(wh => whArray.push(this._db.collection('warehouses').doc(`${wh.id}`).set(wh)));
    Promise.all(whArray).then(res => console.log(res));

    let rolesArray = [];
    let roles = JSON.parse(localStorage.getItem('roles'));
    roles.map(role => rolesArray.push(this._db.collection('roles').doc(`${role.id}`).set(role)));
    Promise.all(rolesArray).then(res => console.log(res));

    let couriersArray = [];
    let couriers = JSON.parse(localStorage.getItem('couriers'));
    couriers.map(courier => couriersArray.push(this._db.collection('couriers').doc(`${courier.id}`).set(courier)));
    Promise.all(couriersArray).then(res => console.log(res));

    let statusArray = [];
    let status = JSON.parse(localStorage.getItem('status'));
    status.map(st => statusArray.push(this._db.collection('status').doc(`${st.id}`).set(st)));
    Promise.all(statusArray).then(res => console.log(res));*/
  }

  firstLogin = (users) => {
    const email = this._auth.auth.currentUser.email;
    const existingUser = users.filter(user => user.username === email)[0];
    if (existingUser && (!existingUser.updatedInfo || existingUser['ask_change_info'] || existingUser['ask_change_pwd'])) {
      this._dialog.open(FirstLoginDialogComponent, {
        data: {
          user: existingUser,
          users: users,
          change_pwd: existingUser.ask_change_pwd ? true : false,
          change_info: existingUser.ask_change_info ? true : false,
          title: existingUser.ask_change_pwd ? `Action Required: Update your password` : `Action Required: Update your information`,
          confirmBtn: 'update',
          cancelBtn: 'Back to login'
        },
        width: '500px',
        disableClose: true
      });
    }
  }
}
