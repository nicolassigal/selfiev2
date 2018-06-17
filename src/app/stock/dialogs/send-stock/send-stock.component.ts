import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

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
    box = {
        id: null,
        shipping_date: null,
        processes: [],
        quantity: null,
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
            let splitted = this.box.shipping_date.split('/');
            this.box.shipping_date = `${splitted[2]}-${splitted[1]}-${splitted[0]}`;
            this.box.quantity = null;
        } else {
            this.box = {
                id: null,
                shipping_date: null,
                processes: [],
                quantity: null,
            };
        }
    }

    private update() {
        if (this.box.quantity) {
            let attachedProcess = { ...this.data.row };
            attachedProcess.box_qty = this.box.quantity;
            attachedProcess.doc_id = this._db.createId();
            this.box.processes.push({ ...attachedProcess });
            this.data.row.box_qty = Number(this.data.row.box_qty) - Number(this.box.quantity);
            let splitted = this.box.shipping_date.split('-');
            this.box.shipping_date = `${splitted[2]}/${splitted[1]}/${splitted[0]}`;
            this.box.id = this.box.id === null ? this.getId() : this.box.id;

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