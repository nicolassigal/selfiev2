import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { Component, OnInit, Inject } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import * as _moment from "moment";
import { take } from "rxjs/operators";
export interface Operation {
  total_weight: number;
  total_value: number;
  box_qty: number;
  hbr_id: number;
  deleted: number;
}

@Component({
  templateUrl: "./delete.component.html",
  styleUrls: ["./delete.component.scss"]
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
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.box = { ...this.data.row };
    this.operations = this.data.op;
  }

  public closeDialog() {
    this._dialogRef.close();
  }

  update = () => {
    let operationsPromiseArray = [];
    this.box.processes.forEach(process => {
        let operation = this.operations.filter(row => row.hbr_id === process.hbr_id);
        let op = operation[0];
        if (op.box_qty > 0) {
          const kgPerUnit = Number(op.total_weight) / Number(op.box_qty);
          const valuePerUnit = Number(op.total_value) / Number(op.box_qty);
          op.box_qty = Number(process.box_qty) + Number(op.box_qty);
          op.total_weight = Number(kgPerUnit) * Number(op.box_qty);
          op.total_value = Number(valuePerUnit) * Number(op.box_qty);
        } else {
          if (op.box_qty === 0) {
            op.deleted = 0;
            op.delivered = 0;
          }
          op.box_qty = Number(process.box_qty);
          op.total_weight = Number(process.total_weight);
          op.total_value = Number(process.total_value);
        }

        operationsPromiseArray.push(this._db.collection('operations').doc(`${op.hbr_id}`).set(op));
    });

    Promise.all(operationsPromiseArray).then(res => {
    this._db.collection('awbs').doc(`${this.data.row.id}`)
        .delete()
        .then(res => this.closeDialog())
        .catch(err => console.log(err));
    });
  }
}
