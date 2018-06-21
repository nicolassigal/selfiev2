import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
@Component({
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss']
})

export class DeleteUserDialogComponent implements OnInit {
    user;
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _dialog: MatDialog,
        private _db: AngularFirestore,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(){
        this.user = { ...this.data.row };
    }

    public closeDialog() {
        this._dialogRef.close();
    }

    update = () => {
        this.data.row.deleted = 1;
        this._db.collection('users').doc(`${this.data.row.id}`).set(this.data.row)
            .then(res => this.closeDialog())
            .catch(err => console.log(err));
    }
}
