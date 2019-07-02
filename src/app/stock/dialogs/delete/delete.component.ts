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
    boxes = []
    box = {
        id: null,
        hbr_id: null,
        checked: false,
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
    operationsBatch;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _dialog: MatDialog,
        private _db: AngularFirestore,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(){
        this.box = { ...this.data.row }; 
        if(this.data.rows){
            this.boxes = [...this.data.rows];
        }
        this.operationsBatch = this._db.firestore.batch();
    }

    public closeDialog() {
        this._dialogRef.close();
    }

    update = () => {
        if(!this.data.rows){
            this.data.row.deleted = 1;
            this.data.row.checked = false;
            this._db.collection('operations').doc(`${this.data.row.id}`).set(this.data.row)
                .then(res => this.closeDialog())
                .catch(err => console.log(err));
        } else {
            this.data.rows.forEach(row => {
                row.deleted = 1;
                row.checked = false;
                let ref = this._db.collection('operations').doc(`${row.id}`).ref;
                this.operationsBatch.set(ref, row);
            });
            this.operationsBatch.commit()
                .then(res => this.closeDialog())
                .catch(err => console.log('error on deleting operations', err));
        }
    }
}
