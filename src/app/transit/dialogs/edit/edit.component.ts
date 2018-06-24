import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
@Component({
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})

export class EditTransitDialogComponent implements OnInit {
    status = [];
    warehouses = [];
    customers = [];
    couriers = [];
    awbs = [];
    box = {
        id: null,
        status_id: null,
        processes: [],
        received_date: null,
        customer_id: null,
        wh_id: null,
        quantity: null,
        shipping_date: null,
        box_qty: null,
        courier_id: null,
        tracking: null
    };
    moment = _moment;
    maxQty;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _dialog: MatDialog,
        private _db: AngularFirestore,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(){
        this.box = { ...this.data.row };
        this.box.shipping_date = this.box.shipping_date ? this.moment.unix(this.box.shipping_date).format("YYYY-MM-DD") : null;
        
        this.status = this.data.status;
        this.warehouses = this.data.warehouses;
        this.couriers = this.data.couriers;
        this.customers = this.data.customers;
        this.awbs = this.data.awbs;
    }

    clearSelect (feature) {
        if (feature === 'wh') {
            this.box.customer_id  = null;
        } else {
            this.box.wh_id  = null;
        }
    }

    changeQty = (val) => {
        if (val > this.maxQty) {
            this.box.quantity = this.maxQty;
        }

        if (val < 0) {
            this.box.quantity = 0;
        }
    }

    public closeDialog() {
        this._dialogRef.close();
    }

    update = () => {
        this.box.shipping_date = this.box.shipping_date ? this.moment(this.box.shipping_date).unix() : null;
        this._db.collection('awbs').doc(`${this.box.id}`).set(this.box)
            .then(res => this.closeDialog())
            .catch(err => console.log(err));
    }

    getDestination = (row) => {
        let destination = null;
        if (row.wh_id) {
          let warehouse = this.warehouses.filter(wh => wh.id === row.wh_id)[0];
          destination = warehouse.name ? `WH: ${warehouse.name}` : null;
        } else if (row.customer_id) {
          let customer = this.customers.filter(customer => customer.id === row.customer_id)[0];
          destination = customer.name ? `${customer.name}` : null;
        }
        return destination;
      }
}
