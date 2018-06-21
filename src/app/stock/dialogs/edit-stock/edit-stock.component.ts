import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';

@Component({
    templateUrl: './edit-stock.component.html',
    styleUrls: ['./../dialog.component.scss']
  })
  export class EditStockDialogComponent implements OnInit {
    warehouses = [];
    customers = [];
    operations = [];
    box = {
      date: null,
      hbr_id: null,
      wh_id: null,
      warehouse: null,
      customer_id: null,
      customer: null,
      box_qty: null,
      total_weight: null,
      total_value: null,
      description: null,
      deleted: 0
     };
    moment = _moment;
    constructor(
      private _dialogRef: MatDialogRef<any>,
      private _dialog: MatDialog,
      private _db: AngularFirestore,
      @Inject(MAT_DIALOG_DATA) public data: any) { }


    ngOnInit(){
      this.box = { ...this.data.row };
      this.box.date = this.box.date ? this.moment.unix(this.box.date).format("YYYY-MM-DD") : null;
      this._db.collection('warehouses', ref => ref.orderBy('name', 'asc'))
      .valueChanges()
      .subscribe(warehouses => this.warehouses = warehouses);
      this._db.collection('operations', ref => ref.orderBy('hbr_id','desc')).valueChanges().subscribe(operations => this.operations = operations);
      this._db.collection('users', ref => ref.orderBy('name', 'asc'))
      .valueChanges()
      .subscribe(customers => this.customers = customers);
    }

    update = () => {
      this.box.date = this.box.date ? this.moment(this.box.date).unix() : null;
      this.box.warehouse = this.box.wh_id ? this.warehouses.filter(wh =>wh.id === this.box.wh_id)[0].name : null;
      this.box.customer = this.box.customer_id ? this.customers.filter(customer =>customer.id === this.box.customer_id)[0].name : null;
      if(!this.box.hbr_id) {
        this.box.hbr_id = Number(this.operations[0].hbr_id) + 1;
        this.box.deleted = 0;
      }
      this._db.collection('operations')
      .doc(`${this.box.hbr_id}`)
      .set(this.box)
      .then(res => {
        this._dialogRef.close();
      }).catch(err => console.log(err));
    }

    public closeDialog() {
      this._dialogRef.close();
    }
  }
