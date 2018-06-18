import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
@Component({
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss']
})

export class DeleteStockDialogComponent implements OnInit {
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
        shipping_date: null
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
    }

    public closeDialog() {
        this._dialogRef.close();
    }

    update = () => {
        this.data.row.deleted = 1;
        this._db.collection('operations').doc(`${this.data.row.hbr_id}`).set(this.data.row)
            .then(res => this.closeDialog())
            .catch(err => console.log(err));
    }
}
