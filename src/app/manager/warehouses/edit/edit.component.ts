import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { UtilsService } from '../../../shared/utils.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})

export class WarehouseDialogComponent implements OnInit {
  warehouse;
  warehouses = [];
  editing = false;
  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _dialog: MatDialog,
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private _utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.warehouse = { ...this.data.row };
    this.warehouses = this.data.warehouses;
  }


  public closeDialog() {
    this._dialogRef.close();
  }

  update = () => {
    this.editing = true;
    if (!this.warehouse.id) {
      this.warehouse.id = this._utils.getId(this.warehouses);
      this._db.collection('warehouses').doc(`${this.warehouse.id}`)
      .set(this.warehouse).then(() =>{
        this.editing = false;
        this.closeDialog();
      });
    } else {
      this._db.collection('warehouses').doc(`${this.warehouse.id}`)
      .set(this.warehouse).then(() =>{
        this.editing = false;
        this.closeDialog();
      });
    }
  }
}
