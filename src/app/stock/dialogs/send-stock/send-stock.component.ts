import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
@Component({
    templateUrl: './send-stock.component.html',
    styleUrls: ['./../dialog.component.scss']
})

export class SendStockDialogComponent implements OnInit {
    sendTo;
    customers = [];
    couriers = [];
    warehouses = [];
    awbs = [];
    moment = _moment;
    box = {
        id: null,
        shipping_date: null,
        processes: [],
        quantity: null,
        customer_id: null,
        wh_id: null,
        total_weight: 0,
        total_value: 0,
        box_qty: 0,
        status_id: 0
    };
    maxQty;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _dialog: MatDialog,
        private _db: AngularFirestore,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        this.maxQty = Number(this.data.row.box_qty);
        this._db.collection('warehouses', ref => ref.orderBy('name', 'asc'))
            .valueChanges()
            .subscribe(warehouses => this.warehouses = warehouses);
        this._db.collection('couriers', ref => ref.orderBy('name', 'asc'))
            .valueChanges()
            .subscribe(couriers => this.couriers = couriers);
        this._db.collection('users', ref => ref.orderBy('name', 'asc'))
            .valueChanges()
            .subscribe(users => this.customers = users);
        this._db.collection('awbs', ref => ref.orderBy('id', 'asc'))
            .valueChanges()
            .subscribe(awbs => this.awbs = awbs);
    }
    public closeDialog() {
        this._dialogRef.close();
    }

    changeQty = (val) => {
        if (val > this.maxQty) {
            this.box.quantity = this.maxQty;
        }

        if (val < 0) {
            this.box.quantity = 0;
        }
    }

    selectAwb(awb) {
        if (awb) {
            this.box = { ...this.awbs.filter(el => el.id === awb)[0] };
            this.box.shipping_date = this.box.shipping_date ? this.moment.unix(this.box.shipping_date).format("YYYY-MM-DD") : null; 
            this.box.quantity = null;
        } else {
            this.box = {
                id: null,
                shipping_date: null,
                processes: [],
                quantity: null,
                customer_id: null,
                wh_id: null,
                total_weight: 0,
                total_value: 0,
                box_qty: 0,
                status: 0
            };
        }
    }

    clearSelect (feature) {
        if (feature === 'wh') {
            this.box.customer_id  = null;
        } else {
            this.box.wh_id  = null;
        }
    }

    /**
     * update airwaybill in database
     */
    private update() {
        if (this.box.quantity) {
            let attachedProcess = { ...this.data.row };
            attachedProcess.box_qty = this.box.quantity;
            attachedProcess.doc_id = this._db.createId();

            //get value per unit
            let kgPerUnit = Number(this.data.row.total_weight) / Number(this.data.row.box_qty);
            let valuePerUnit = Number(this.data.row.total_value) / Number(this.data.row.box_qty);

            //calc actual weight and value in transit
            attachedProcess.total_weight = Number(kgPerUnit) * Number(attachedProcess.box_qty);
            attachedProcess.total_value = Number(valuePerUnit) * Number(attachedProcess.box_qty);

            this.box.processes.push({ ...attachedProcess });

            //calc total values in guide
            this.box.total_weight = 0;
            this.box.total_value = 0;
            this.box.box_qty = 0;
            this.box.processes.map(process => {
                this.box.total_weight = Number(this.box.total_weight) + Number(process.total_weight);
                this.box.total_value = Number(this.box.total_value) + Number(process.total_value);
                this.box.box_qty = Number(this.box.box_qty) + Number(process.box_qty);
            });

            //calc remaining values in stock
            this.data.row.box_qty = Number(this.data.row.box_qty) - Number(this.box.quantity);
            this.data.row.total_weight = Number(kgPerUnit) * Number(this.data.row.box_qty);
            this.data.row.total_value = Number(valuePerUnit) * Number(this.data.row.box_qty);

            //get box id
            this.box.id = this.box.id === null ? this.getId() : this.box.id;
            this.box.status_id = 0;
            //parse date to unix timestamp
            this.box.shipping_date = this.box.shipping_date ? this.moment(this.box.shipping_date).unix() : null;
            console.log(this.box, this.data.row);
            //push to database
            this._db.collection('awbs').doc(`${this.box.id}`).set(this.box)
                .then(res => {
                    this._db.collection('operations')
                        .doc(`${this.data.row.hbr_id}`)
                        .set(this.data.row)
                        .then(res => {
                            this._dialogRef.close();
                        }).catch(err => console.log(err));
                }).catch(err => console.log(err));

        }
    }

    /**
     * gets max id and returns the next one
     */
    private getId = () => {
        let maxid = 0;
        this.awbs.map(awb => {
            if (awb.id > maxid) {
                maxid = awb.id;
            }
        })
        return maxid + 1;
    }
}