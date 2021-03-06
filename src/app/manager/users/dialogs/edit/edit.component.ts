import { AuthService } from './../../../../shared/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { UtilsService } from '../../../../shared/utils.service';
import { Http, RequestOptions, Headers } from '@angular/http';
import * as firebase from 'firebase/app';
@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})

export class UserDialogComponent implements OnInit {
  roles = [];
  warehouses = [];
  users = [];
  oldPwd;
  maxQty;
  password;
  editing = false;
  password2;
  askToChange = false;
  ask_change_info = false;
  ask_change_pwd = false;
  errors;
  secondaryApp = firebase.app('Secondary');
  user = {
    name: null,
    address: null,
    city: null,
    country: null,
    cuit: null,
    email: null,
    username: null,
    id: null,
    password: null,
    role: 0,
    role_name: null,
    tel: null,
    wh_id: null,
    wh_name: null,
    updatedInfo: false,
    ask_change_info: false,
    ask_change_pwd: false,
    zip_code: null,
    inscript_type: null,
    key_type:null,
    id_key: null,

  };

  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _dialog: MatDialog,
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private _utils: UtilsService,
    private authService: AuthService,
    private _http: Http,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.user = { ...this.data.row };
    this.oldPwd = this.user.password || null;
    this.roles = this.data.roles;
    this.users = this.data.users;
    this.warehouses = this.data.warehouses;
    this.ask_change_info = this.user.ask_change_info || false;
    this.ask_change_pwd = this.user.ask_change_pwd || false;
  }


  public closeDialog() {
    this._dialogRef.close();
  }

  update = async () => {
    const exists = this.users.some(user => user.username === this.user.username || user.email === this.user.username);
    this.user.updatedInfo = this.ask_change_info ? false : true;
    this.user.ask_change_info = this.ask_change_info ? true : false;
    this.user.ask_change_pwd = this.ask_change_pwd ? true : false;
    if (!this.user.id) {
      if (this.password && this.password2 && this.password === this.password2) {
        if (!exists) {
          this.editing = true;
          this.errors = '';
          this.user.id = this._utils.getId(this.users);
          this.user.email = this.user.username;
          this.user.role = this.user.role || 0;
          this.user.password = this.password;
          try {
            await this.secondaryApp.auth().createUserWithEmailAndPassword(this.user.username, this.password)
            await this.secondaryApp.auth().signOut();
            await this._db.collection('users').doc(`${this.user.id}`).set(this.user)
            this.editing = false;
            this.closeDialog();
            return;
          } catch (err) {
              this.editing = false;
              console.log(err);
              this.errors = err.message;
          }
        } else {
          this.editing = false;
          this.errors = 'E-mail already exists';
        }
      } else {
        this.editing = false;
        this.errors = 'Passwords doesnt match';
      }
    } else {
      this.editing = true;
      this.errors = '';
      if (this.password && this.password2 && this.password === this.password2) {
        try {
          await this.secondaryApp.auth().signInWithEmailAndPassword(this.data.row.username, this.data.row.password)
          await this.secondaryApp.auth().currentUser.updateEmail(this.user.username)
          await this.secondaryApp.auth().currentUser.updatePassword(this.password)
          await this.secondaryApp.auth().signOut();
          this.user.password = this.password,
          this.user.updatedInfo = this.ask_change_info ? false : true;
          this.user.ask_change_info = this.ask_change_info ? true : false;
          this.user.ask_change_pwd = this.ask_change_pwd ? true : false;
          await this._db.collection('users').doc(`${this.user.id}`).set(this.user)
          this.editing = false;
          this.closeDialog();
        } catch (err) {
          this.editing = false;
          console.log(err);
          this.errors = err.message;
        }
      } else {
        if (this.data.row.username !== this.user.username) {
          try {
            await this.secondaryApp.auth().signInWithEmailAndPassword(this.data.row.username, this.data.row.password)
            await this.secondaryApp.auth().currentUser.updateEmail(this.user.username)
            this.user.email = this.user.username;
            this.user.updatedInfo = this.ask_change_info ? false : true;
            this.user.ask_change_info = this.ask_change_info ? true : false;
            this.user.ask_change_pwd = this.ask_change_pwd ? true : false;
            await this.secondaryApp.auth().signOut();
            await this._db.collection('users').doc(`${this.user.id}`).set(this.user)
            this.editing = false;
            this.closeDialog();
          } catch (err) {
            this.editing = false;
            console.log(err);
            this.errors = err.message;
          }
        } else {
          this.user.updatedInfo = this.ask_change_info ? false : true;
          this.user.ask_change_info = this.ask_change_info ? true : false;
          this.user.ask_change_pwd = this.ask_change_pwd ? true : false;
          try {
            await this._db.collection('users').doc(`${this.user.id}`).set(this.user)
            this.editing = false;
            this.closeDialog();
          } catch (err) {
            console.log(err)
          }
        }
      }
    }
  }
}
