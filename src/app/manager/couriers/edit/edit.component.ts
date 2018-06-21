import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { UtilsService } from '../../../shared/utils.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})

export class CourierDialogComponent implements OnInit {
  editing = false;
  courier;
  couriers = [];
  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _dialog: MatDialog,
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private _utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.courier = { ...this.data.row };
    this._db.collection('couriers').valueChanges().subscribe(couriers => this.couriers = couriers);
  }


  public closeDialog() {
    this._dialogRef.close();
  }

  update = () => {
    this.editing = true;
    if (!this.courier.id) {
      this.courier.id = this._utils.getId(this.couriers);
      this._db.collection('couriers').doc(`${this.courier.id}`)
      .set(this.courier).then(() =>{
        this.editing = false;
        this.closeDialog();
      });
    } else {
      this._db.collection('couriers').doc(`${this.courier.id}`)
      .set(this.courier).then(() =>{
        this.editing = false;
        this.closeDialog();
      });
    }
  }
}
