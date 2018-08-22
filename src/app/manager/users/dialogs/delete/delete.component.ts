import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
import * as firebase from 'firebase/app';
import { take } from 'rxjs/operators';
import { DataService } from '../../../../shared/data.service';
@Component({
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss']
})

export class DeleteUserDialogComponent implements OnInit {
    user;
    deleting = false;
    operations = [];
    secondaryApp = firebase.app('Secondary');
    email = '';
    error = '';
    constructor(
        private _dialogRef: MatDialogRef<any>,
        private _dialog: MatDialog,
        private _db: AngularFirestore,
        private _dataService: DataService,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(){
        this.user = { ...this.data.row };
        this.operations = this._dataService.getStock();
        this._dataService.stockSubject.subscribe(op => this.operations = op);
    }

    public closeDialog() {
        this._dialogRef.close();
    }

    update = () => {
        if (this.email === this.user.username || this.email === this.user.email ) {
          this.deleting = true;
        let batch = this._db.firestore.batch();
        this.secondaryApp.auth().signInWithEmailAndPassword(this.user.username, this.user.password).then(res => {
            this.secondaryApp.auth().currentUser.delete().then(res => {
                let customerRows = this.operations.filter(op => op.customer_id == this.user.id);
                customerRows.map(row => {
                    row['deleted'] = 1;
                    let ref = this._db.collection('operations').doc(`${row['hbr_id']}`).ref;
                    batch.set(ref, row);
                });
                batch.commit().then(()=> {
                    this._db.collection('users').doc(`${this.data.row.id}`).delete()
                    .then(res => {
                        this.secondaryApp.auth().signOut();
                        this.closeDialog();
                        this.deleting = false;
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
      } else {
        this.error = 'email doesnt match';
      }
    }
}
