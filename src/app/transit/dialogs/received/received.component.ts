import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
@Component({
    templateUrl: './received.component.html',
    styleUrls: ['./received.component.scss']
})

export class ReceivedStockDialogComponent implements OnInit {
    status = [];
    warehouses = [];
    customers = [];
    box = {
        id: null,
        status_id: null,
        status: null,
        processes: [],
        received_date: null,
        customer_id: null,
        wh_id: null
    };
    moment = _moment;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _dialog: MatDialog,
        private _db: AngularFirestore,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(){
        this.box = { ...this.data.row };
        console.log(this.box);
        this._db.collection('status').valueChanges().subscribe(status => this.status = status);
        this._db.collection('warehouses').valueChanges().subscribe(warehouses => this.warehouses = warehouses);
        this._db.collection('users').valueChanges().subscribe(customers => this.customers = customers);
    }

    public closeDialog() {
        this._dialogRef.close();
    }

    update = () => {
        this.box.status = this.status.filter(e => e.id === this.box.status_id)[0].name;
        if (this.box.status_id !== 3) {
        this._db.collection('awbs')
            .doc(`${this.box.id}`)
            .set(this.box)
            .then(res => this._dialogRef.close())
            .catch(err => console.log(err));
        } else {
            let promises = [];
            this.box.received_date = this.box.received_date ? this.moment(this.box.received_date).unix() : null;

            this.box.processes.map(process => {
                process.received_date = this.box.received_date;
                process.wh_id = this.box.wh_id;
                process.customer_id = this.box.customer_id;
                process.destination = this.getDestination(process);
                const id = this._db.createId();
                promises.push(this._db.collection('delivered').doc(`${id}`).set(process));
            });
            Promise.all(promises)
                .then(res => {
                  this._db.collection('awbs')
                  .doc(`${this.box.id}`)
                  .delete()
                  .then(res => this._dialogRef.close())
                  .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }
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
