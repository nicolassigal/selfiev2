import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { UtilsService } from './../../../shared/utils.service';
import * as _moment from 'moment';
import { take } from 'rxjs/operators';
@Component({
    templateUrl: './received.component.html',
    styleUrls: ['./received.component.scss']
})

export class ReceivedStockDialogComponent implements OnInit {
    status = [];
    warehouses = [];
    operations = [];
    customers = [];
    moment = _moment;
    box = {
        id: null,
        status_id: null,
        status: null,
        processes: [],
        received_date: null,
        customer_id: null,
        courier_id: null,
        wh_id: null,
        dest_type: null
    };

    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _dialog: MatDialog,
        private _db: AngularFirestore,
        private _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        this.box = { ...this.data.row };
        this.status = this.data.status;
        this.warehouses = this.data.warehouses;
        this.customers = this.data.customers;
        this.operations = [...this.data.operations];
        this.box.received_date = this.moment().format('YYYY-MM-DD');
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
            const promises = [];
            this.box.received_date = this.box.received_date ? this.moment(this.box.received_date).unix() : null;
            let max_id = Number(this.operations[0].hbr_id);
            this.box.processes.map(process => {
                process.received_date = this.box.received_date;
                process.wh_id = this.box.wh_id;
                process.customer_id = this.box.customer_id;
                process.courier_id = this.box.courier_id;
                process.destination = this.getDestination(process);
                if (this.box.dest_type === 'customer') {
                    const id = this._db.createId();
                    promises.push(this._db.collection('delivered').doc(`${id}`).set(process));
                } else if (this.box.dest_type === 'warehouse') {
                    if (Number(process.initial_qty) !== Number(process.box_qty)) {
                      if (!process.linked_op) {
                        process.linked_op = process.hbr_id;
                      }
                      max_id = max_id + 1;
                      process.hbr_id = max_id;
                    }
                    process.date = process.received_date;
                    process.warehouse = this.warehouses.filter(wh => wh.id === process.wh_id)[0]['name'];

                    promises.push(this._db.collection('operations').doc(`${process.hbr_id}`).set(process));
                }
            });
            Promise.all(promises)
                .then(res => {
                  this._db.collection('awbs')
                  .doc(`${this.box.id}`)
                  .delete()
                  .then(() => this._dialogRef.close())
                  .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }
    }

    getDestination = (row) => {
      let destination = null;
        if (row.wh_id) {
          const warehouse = this.warehouses.filter(wh => wh.id === row.wh_id)[0];
          destination = warehouse.name ? `WH: ${warehouse.name}` : null;
        } else if (row.customer_id) {
          const customer = this.customers.filter(user => user.id === row.customer_id)[0];
          destination = customer.name ? `${customer.name}` : null;
        }
        return destination;
      }
}
