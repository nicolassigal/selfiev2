import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject, Renderer, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
import { UtilsService } from '../../../shared/utils.service';
import { take } from 'rxjs/operators';
import { DataService } from '../../../shared/data.service';
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
    rows = [];
    moment = _moment;
    selectedRow = null;
    box = {
        id: null,
        shipping_date: null,
        checked: false,
        processes: [],
        quantity: null,
        customer_id: null,
        wh_id: null,
        total_weight: 0,
        profit: 0,
        box_qty: 0,
        status_id: 0,
        courier_id: null,
        tracking: '',
        dest_type: null
    };
    maxQty;
    @ViewChild('mat-dialog-container') dialog;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _dialog: MatDialog,
        private _db: AngularFirestore,
        private _dataService: DataService,
        private _utils: UtilsService,
        private _elementRef: ElementRef,
        private _renderer: Renderer,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        if(this.data.row) { 
        this.maxQty = Number(this.data.row.box_qty);
        }
        this.warehouses = this.data.warehouses.sort((a, b) => a.name.localeCompare(b.name));
        this.couriers = this.data.couriers.sort((a, b) => a.name.localeCompare(b.name));
        this.customers = this.data.customers.sort((a, b) => a.name.localeCompare(b.name));
        this.awbs = this._dataService.getAwbs();
        this.awbs = this.awbs.filter(row => row.status_id < 3);
        this.box.quantity = this.maxQty;
        this.box.shipping_date = this.moment().format("YYYY-MM-DD");
        
        if(this.data.rows) {
            this.rows = [...this.data.rows];
            this.rows.map(row => row.quantity = row.box_qty);
        }
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

    changeRowsQty = (val) => {
        const maxQty = Number(this.selectedRow.box_qty);
        if (val > maxQty) {
            this.selectedRow.quantity = maxQty;
        } else if (val < 0) {
            this.selectedRow.quantity = 0;
        } else {
            this.selectedRow.quantity = Number(val);
        }

        this.rows.map(row => {
            if(row.hbr_id === this.selectedRow.hbr_id) {
                row = { ...this.selectedRow }
            }
        });
    }

    selectAwb(awb) {
        if (awb) {
            this.box = { ...this.awbs.filter(el => el.id === awb)[0] };
            this.box.shipping_date = this.box.shipping_date ? this.moment.unix(this.box.shipping_date).format("YYYY-MM-DD") : null;
            this.box.quantity = null;
        } else {
            this.box = {
                id: null,
                checked: false,
                shipping_date: null,
                processes: [],
                quantity: null,
                customer_id: null,
                wh_id: null,
                total_weight: 0,
                profit: 0,
                box_qty: 0,
                status_id: 0,
                courier_id: null,
                tracking: null,
                dest_type: null
            };
        }
    }

    clearSelect (feature) {
        if (feature === 'wh') {
            this.box.customer_id  = null;
            this.box.dest_type = 'warehouse';
        } else {
            this.box.wh_id  = null;
            this.box.dest_type = 'customer';
        }
    }

    /**
     * update airwaybill in database
     */
    updateOne() {
        if (this.box.quantity) {
            const attachedProcess = { ...this.data.row };
            attachedProcess.box_qty = this.box.quantity;
            attachedProcess.doc_id = this._db.createId();

            // get value per unit
            const kgPerUnit = Number(this.data.row.total_weight) / Number(this.data.row.box_qty);
            const valuePerUnit = Number(this.data.row.profit) / Number(this.data.row.box_qty);

            // calc actual weight and value in transit
            attachedProcess.total_weight = Number(kgPerUnit) * Number(attachedProcess.box_qty);
            attachedProcess.profit = Number(valuePerUnit) * Number(attachedProcess.box_qty);

            this.box.processes.push({ ...attachedProcess });

            // calc total profit in guide
            this.box.total_weight = 0;
            this.box.profit = 0;
            this.box.box_qty = 0;
            this.box.processes.map(process => {
                this.box.total_weight = Number(this.box.total_weight) + Number(process.total_weight);
                this.box.profit = Number(this.box.profit) + Number(process.profit);
                this.box.box_qty = Number(this.box.box_qty) + Number(process.box_qty);
            });

            // calc remaining values in stock
            this.data.row.box_qty = Number(this.data.row.box_qty) - Number(this.box.quantity);
            this.data.row.total_weight = Number(kgPerUnit) * Number(this.data.row.box_qty);
            this.data.row.profit = Number(valuePerUnit) * Number(this.data.row.box_qty);

            if (this.data.row.box_qty === 0) {
            this.data.row.delivered = 1;
            }
            // get box id
            this.box.id = this.box.id === null ? this._utils.getId(this.awbs) : this.box.id;
            this.box.status_id = 0;

            // parse date to unix timestamp
            this.box.shipping_date = this.box.shipping_date ? this.moment(this.box.shipping_date).unix() : null;

            this.box.checked = false;

            // push to database
            this._db.collection('awbs').doc(`${this.box.id}`)
            .set(this.box)
            .then(res => {
                this._db.collection('operations')
                    .doc(`${this.data.row.hbr_id}`)
                    .set(this.data.row)
                    .then(() => this._dialogRef.close())
                    .catch(err => console.log(err));
            }).catch(err => console.log(err));

        }  
    }

    updateAll() {
        this.rows.map(row => {
            row.checked = false;
            if(row.quantity) {
                const attachedProcess = { ...row };
                attachedProcess.box_qty = row.quantity;
                attachedProcess.doc_id = this._db.createId();
                // get value per unit
                const kgPerUnit = Number(row.total_weight) / Number(row.box_qty);
                const valuePerUnit = Number(row.profit) / Number(row.box_qty);

                // calc actual weight and value in transit
                attachedProcess.total_weight = Number(kgPerUnit) * Number(attachedProcess.box_qty);
                attachedProcess.profit = Number(valuePerUnit) * Number(attachedProcess.box_qty);

                this.box.processes.push({ ...attachedProcess });

                // calc remaining values in stock
                row.box_qty = Number(row.box_qty) - Number(row.quantity);
                row.total_weight = Number(kgPerUnit) * Number(row.box_qty);
                row.profit = Number(valuePerUnit) * Number(row.box_qty);

                if (row.box_qty === 0) {
                    row.delivered = 1;
                }
            }
        })

        // calc total profit in guide
        this.box.total_weight = 0;
        this.box.profit = 0;
        this.box.box_qty = 0;
        this.box.processes.map(process => {
            this.box.total_weight = Number(this.box.total_weight) + Number(process.total_weight);
            this.box.profit = Number(this.box.profit) + Number(process.profit);
            this.box.box_qty = Number(this.box.box_qty) + Number(process.box_qty);
            this.box.quantity = Number(this.box.box_qty);
        });

         // get box id
         this.box.id = this.box.id === null ? this._utils.getId(this.awbs) : this.box.id;
         this.box.status_id = 0;

         // parse date to unix timestamp
         this.box.shipping_date = this.box.shipping_date ? this.moment(this.box.shipping_date).unix() : null;

         this.box.checked = false;
         // push to database
         this._db.collection('awbs').doc(`${this.box.id}`)
         .set(this.box)
         .then(res => {
            let promiseArray = [];
            this.data.rows.forEach(row => {
                row.checked = false;
                promiseArray.push(this._db.collection('operations').doc(`${row.hbr_id}`).set(row))
        });
            Promise.all(promiseArray)
                .then(() => {
                    this.data.rows.map(row => row.checked = false);
                    this._dialogRef.close();
                })
                .catch(err => console.log(err));
         }).catch(err => console.log(err));
    }

    triggerUpdate() {
        this.rows.length ? this.updateAll() : this.updateOne();
    }
}

//TODO Enviar todas las cajas con sus cantidades individuales.
