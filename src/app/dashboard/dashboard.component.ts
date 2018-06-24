import { DataService } from './../shared/data.service';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private _db: AngularFirestore,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this._db.collection('users', ref => ref.orderBy('name', 'asc'))
    .valueChanges()
    .subscribe(customers => this.dataService.setCustomers(customers));

    this._db.collection('operations', ref => ref
      .where('deleted', '==', 0)
      .orderBy('hbr_id', 'desc'))
    .valueChanges()
    .subscribe(stock => this.dataService.setStock(stock));

    this._db.collection('warehouses', ref => ref.orderBy('name', 'asc'))
    .valueChanges()
    .subscribe(warehouses => this.dataService.setWarehouses(warehouses));

    this._db.collection('couriers', ref => ref.orderBy('name', 'asc'))
    .valueChanges()
    .subscribe(couriers => this.dataService.setCouriers(couriers));

    this._db.collection('awbs', ref => ref.orderBy('id', 'asc'))
    .valueChanges()
    .subscribe(awbs => this.dataService.setAwbs(awbs));

    this._db.collection('delivered', ref => ref.orderBy('hbr_id', 'desc'))
    .valueChanges()
    .subscribe(delivered => this.dataService.setDelivered(delivered));

    this._db.collection('status')
    .valueChanges()
    .subscribe(status => this.dataService.setStatus(status));

    this._db.collection('roles')
    .valueChanges()
    .subscribe(roles => this.dataService.setRoles(roles));
  }

}
