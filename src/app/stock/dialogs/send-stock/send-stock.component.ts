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
    warehouses = [];
    markedRows = [];
    stock = [];
    moment = _moment;
    selectedRow = null;
    box;
    maxQty;
    rowQty;
    kgPerUnit = 0;
    valuePerUnit = 0;
    from;
    to;
    //TODO Remove this
    //awbs = [];
    //couriers = [];
    @ViewChild('mat-dialog-container') dialog;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _db: AngularFirestore,
        private _dataService: DataService,
        private _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        this.box = {
            ...this.box, 
            ...this.data.row,
            wh_id: null,
            customer_id: null,
            tracking: null,
            history: { from: {}, to:{}}
        };
        this.stock = [...this._dataService.getStock()];
        if(this.data.row) { 
            this.maxQty = Number(this.data.row.box_qty);
            this.box.hbr_id = this.data.row.hbr_id;
            this.kgPerUnit = Number(this.data.row.total_weight) / Number(this.data.row.box_qty);
            this.valuePerUnit = Number(this.data.row.profit) / Number(this.data.row.box_qty);
        }
        this.warehouses = this.data.warehouses.sort((a, b) => a.name.localeCompare(b.name));
        this.customers = this.data.customers.sort((a, b) => a.name.localeCompare(b.name));
        this.box.quantity = this.maxQty;
        this.box.shipping_date = this.moment().format("YYYY-MM-DD");
        //TODO Remove this
        //this.couriers = this.data.couriers.sort((a, b) => a.name.localeCompare(b.name));
        // this.awbs = this._dataService.getAwbs();
        // this.awbs = this.awbs.filter(row => row.status_id < 3);
        
        if(this.data.rows) {
            this.markedRows = [...this.data.rows];
            this.markedRows.map(row => row.quantity = row.box_qty);
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

        this.markedRows.map(row => {
            if(row.hbr_id === this.selectedRow.hbr_id) {
                row = { ...this.selectedRow }
            }
        });
    }

    clearSelect (feature) {
        this.from = {
            type: 'warehouse',
            name: this.data.row.warehouse,
            id: this.data.row.wh_id
        }

        if (this.data.row.hasOwnProperty('dest_type') &&
        this.data.row.dest_type !== "Warehouse") {
            this.from = {
                type: 'customer',
                name: this.data.row.customer,
                id: this.data.row.customer_id
            }
        }

        if (feature === 'wh') {
            this.box.customer_id  = null;
            this.box.dest_type = 'Warehouse';
        } else {
            this.box.wh_id  = null;
            this.box.dest_type = 'Customer';
        }
    }
    
    updateAll = async () => {}

    //Update one Row
    updateOne = async () => {
        const newBox = {...this.box};
        const oldBox = {...this.data.row};
        const { entry_point, warehouse, wh_id } = oldBox;
        if(!entry_point) {
            const entry = { name: warehouse, id: wh_id}
            oldBox.entry_point = {...entry};
            newBox.entry_point = {...entry};
        }
        if (newBox.wh_id) {
            const warehouse = this._dataService.getWarehouseById(newBox.wh_id);
            newBox.warehouse = warehouse.name;
            this.to = {
                type: 'warehouse',
                name: newBox.warehouse,
                id: newBox.wh_id
            }

        }
        if (newBox.customer_id) {
            const customer = this._dataService.getCustomerById(newBox.customer_id);
            newBox.customer = customer.name;
            this.to = {
                type: 'customer',
                name: newBox.customer,
                id: newBox.customer_id
            }
        }
        newBox.box_qty = newBox.quantity;
        newBox.shipping_date = newBox.shipping_date ? this.moment(newBox.shipping_date).unix() :null;
        newBox.history.from = this.from;
        newBox.history.to = this.to;
        oldBox.checked = false;
        newBox.checked = false;
        if(newBox.quantity !== newBox.initial_qty && Number(newBox.quantity) < Number(this.maxQty)) {
            newBox.id = this._utils.getId(this.stock);
            newBox.total_weight = this.kgPerUnit * newBox.box_qty;
            newBox.profit = this.valuePerUnit * newBox.box_qty;
            oldBox.box_qty = Number(oldBox.box_qty) - Number(newBox.box_qty);
            oldBox.total_weight = this.kgPerUnit * oldBox.box_qty;
            oldBox.profit = this.valuePerUnit * oldBox.box_qty;
            try {
                await this._db.collection('operations').doc(`${oldBox.id}`).set(oldBox);
                await this._db.collection('operations').doc(`${newBox.id}`).set(newBox);
            } catch (e) {
                console.error(e);
            }
        } else {
            try {
                await this._db.collection('operations').doc(`${newBox.id}`).set(newBox);
            } catch(e) {
                console.error(e);
            }  
        }
        this.data.row.checked = false;
        this._dialogRef.close();
    }

    triggerUpdate() {
        this.markedRows.length ? this.updateAll() : this.updateOne();
    }

    // updateAll() {
    //     this.rows.map(row => {
    //         row.checked = false;
    //         if(row.quantity) {
    //             const attachedProcess = { ...row };
    //             attachedProcess.box_qty = row.quantity;
    //             attachedProcess.doc_id = this._db.createId();
    //             // get value per unit
    //             const kgPerUnit = Number(row.total_weight) / Number(row.box_qty);
    //             const valuePerUnit = Number(row.profit) / Number(row.box_qty);

    //             // calc actual weight and value in transit
    //             attachedProcess.total_weight = Number(kgPerUnit) * Number(attachedProcess.box_qty);
    //             attachedProcess.profit = Number(valuePerUnit) * Number(attachedProcess.box_qty);

    //             this.box.processes.push({ ...attachedProcess });

    //             // calc remaining values in stock
    //             row.box_qty = Number(row.box_qty) - Number(row.quantity);
    //             row.total_weight = Number(kgPerUnit) * Number(row.box_qty);
    //             row.profit = Number(valuePerUnit) * Number(row.box_qty);

    //             if (row.box_qty === 0) {
    //                 row.delivered = 1;
    //             }
    //         }
    //     })

    //     // calc total profit in guide
    //     this.box.total_weight = 0;
    //     this.box.profit = 0;
    //     this.box.box_qty = 0;
    //     this.box.processes.map(process => {
    //         this.box.total_weight = Number(this.box.total_weight) + Number(process.total_weight);
    //         this.box.profit = Number(this.box.profit) + Number(process.profit);
    //         this.box.box_qty = Number(this.box.box_qty) + Number(process.box_qty);
    //         this.box.quantity = Number(this.box.box_qty);
    //     });

    //      // get box id
    //      this.box.id = this.box.id === null ? this._utils.getId(this.awbs) : this.box.id;
    //      this.box.status_id = 0;

    //      // parse date to unix timestamp
    //      this.box.shipping_date = this.box.shipping_date ? this.moment(this.box.shipping_date).unix() : null;

    //      this.box.checked = false;
    //      // push to database
    //      this._db.collection('awbs').doc(`${this.box.id}`)
    //      .set(this.box)
    //      .then(res => {
    //         let promiseArray = [];
    //         this.data.rows.forEach(row => {
    //             row.checked = false;
    //             promiseArray.push(this._db.collection('operations').doc(`${row.hbr_id}`).set(row))
    //     });
    //         Promise.all(promiseArray)
    //             .then(() => {
    //                 this.data.rows.map(row => row.checked = false);
    //                 this._dialogRef.close();
    //             })
    //             .catch(err => console.log(err));
    //      }).catch(err => console.log(err));
    // }
}

//TODO Enviar todas las cajas con sus cantidades individuales.
