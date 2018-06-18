import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
@Component({
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss']
})

export class DeleteTransitDialogComponent implements OnInit {
    status = [];
    warehouses = [];
    customers = [];
    couriers = [];
    awbs = [];
    operations = [];
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
        this._db.collection('operations').valueChanges().subscribe(operations => this.operations = operations);
    }

    public closeDialog() {
        this._dialogRef.close();
    }

    update = () => {
        this.box.processes.map(process => {
            this.operations.map(operation => {
                if (operation.hbr_id === process.hbr_id) {
                    let kgPerUnit = Number(operation.total_weight) / Number(operation.box_qty);
                    let valuePerUnit = Number(operation.total_value) / Number(operation.box_qty);

                    operation.box_qty = Number(process.box_qty) + Number(operation.box_qty);
                    operation.total_weight = Number(operation.total_weight) * Number(operation.box_qty);
                    operation.total_value = Number(operation.total_value) * Number(operation.box_qty);

                    this._db.collection('operations').doc(`${operation.hbr_id}`).set(operation)
                        .then(res => console.log(res))
                        .catch(err => console.log(err));
                }
            });
        })

        this._db.collection('awbs').doc(`${this.data.row.id}`).delete()
            .then(res => this.closeDialog())
            .catch(err => console.log(err));
    }
}