import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { UtilsService } from '../../../../shared/utils.service';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})

export class UserDialogComponent implements OnInit {
  roles = [];
  warehouses = [];
  users = [];
  oldPwd;
  user;
  maxQty;
  password;
  editing = false;
  password2;
  errors;
  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _dialog: MatDialog,
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private _utils: UtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.user = { ...this.data.row };
    this.oldPwd = this.user.password || null;
    this._db.collection('roles').valueChanges().subscribe(roles => this.roles = roles);
    this._db.collection('users').valueChanges().subscribe(users => this.users = users);
    this._db.collection('warehouses').valueChanges().subscribe(warehouses => this.warehouses = warehouses);
  }


  public closeDialog() {
    this._dialogRef.close();
  }

  update = () => {
    const exists = this.users.some(user => user.username === this.user.username || user.email === this.user.username);
    if (!this.user.id) {
      if (this.password && this.password2 && this.password === this.password2) {
        if (!exists) {
          this.editing = true;
          this.errors = '';
          this.user.id = this._utils.getId(this.users);
          this.user.email = this.user.username;
          this.user.role = this.user.role || 0;
          this._auth.auth.createUserWithEmailAndPassword(this.user.username, this.password).then(() => {
            this._db.collection('users').doc(`${this.user.id}`).set(this.user)
              .then(res => {
                this.editing = false;
                this.closeDialog();
              })
              .catch(err => {
                this.editing = false;
                console.log(err);
                this.errors = err.message;
              });
          });
        } else {
          this.editing = false;
          this.errors = 'E-mail already exists';
        }
      } else {
        this.editing = false;
        this.errors = 'Passwords doesnt match';
      }
    } else {
      this._db.collection('users').doc(`${this.user.id}`).set(this.user)
        .then(res => this.closeDialog())
        .catch(err => console.log(err));
    }
  }
}
