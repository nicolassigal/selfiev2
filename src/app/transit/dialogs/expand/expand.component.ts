import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { Component, OnInit, Inject } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import * as _moment from "moment";
import { take } from "rxjs/operators";

export interface Operation {
  total_weight: number;
  profit: number;
  box_qty: number;
  hbr_id: number;
}

@Component({
  templateUrl: "./expand.component.html",
  styleUrls: ["./expand.component.scss"]
})

export class ExpandTransitDialogComponent implements OnInit {
  moment = _moment;
  panelOpenState: boolean = false;
  role;
  process = {
    processes: []
  };
  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _dialog: MatDialog,
    private _db: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.process = { ...this.data.row };
    this.role = this.data.role;
  }

  public closeDialog() {
    this._dialogRef.close();
  }
}
