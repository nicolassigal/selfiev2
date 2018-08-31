import { AuthService } from './../../shared/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
@Component({
  templateUrl: './firstLogin.dialog.html',
  styleUrls: ['./firstLogin.dialog.scss']
})

export class FirstLoginDialogComponent implements OnInit {
    user = {
      username: null,
      email: null,
      password: '',
      id: null,
      updatedInfo: false,
      ask_change_pwd: false,
      ask_change_info: false,
      name: null,
      cuit: null,
      address: null,
      city: null,
      country: null,
      tel: null,
      role: 0,
      wh_id: null
    };
    secondaryApp = firebase.app('Secondary');
    users = [];
    editing = false;
    change_pwd = false;
    change_info = false;
    password;
    password2;
    oldPassword;
    errors;
  constructor(
    private _dialogRef: MatDialogRef<any>,
    private _dialog: MatDialog,
    private _db: AngularFirestore,
    private _auth: AngularFireAuth,
    private _router: Router,
    private _authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.user = {...this.data.user};
    this.users = [...this.data.users];
    this.change_pwd = this.data.change_pwd;
    this.change_info = this.data.change_info;
    this.password = this.data.user.password;
    if (!this.change_pwd) {
      this.oldPassword = this.data.user.password;
    }
  }


  public closeDialog() {
    this._dialogRef.close();
  }

  changePwd = () => {
    this.editing = true;
    this.errors = '';
    if (this.password && this.password2 && this.password === this.password2) {
      this.secondaryApp.auth().signInWithEmailAndPassword(this.data.user.username, this.oldPassword).then(res => {
        this.updatePassword();
      }).catch(err => {
        this.editing = false;
        console.log(err);
        if (err.code === 'auth/wrong-password') {
          this.errors = 'invalid old password';
        }
      });
    } else {
      this.editing = false;
      this.errors = 'Please enter a valid password / password doesnt match';
    }
  }

  update = () => {
    this.editing = true;
        this.errors = '';
        if (!this.change_pwd || this.password && this.password2 && this.password === this.password2) {
            if (this.data.user.username !== this.user.username) {
              const exists = this.users.some(user => user.username === this.user.username || user.email === this.user.username);
              if (!exists) {
                this.secondaryApp.auth().signInWithEmailAndPassword(this.data.user.username, this.oldPassword).then(res => {
                    this.secondaryApp.auth().currentUser.updateEmail(this.user.username).then(res => {
                      this.updatePassword();
                    }).catch(err => {
                      this.editing = false;
                      console.log(err);
                      this.errors = err.message;
                    });
                }).catch(err => {
                  this.editing = false;
                  console.log(err);
                  if (err.code === 'auth/wrong-password') {
                    this.errors = 'invalid old password';
                  }
                });
              } else {
                this.editing = false;
                this.errors = 'E-mail already exists';
              }
          } else {
            this.updateInfo();
          }
        } else {
          this.editing = false;
          this.errors = 'Please enter a valid password / password doesnt match';
        }
  }

  updateInfo = () => {
    this.user.password = this.password,
    this.user.updatedInfo = true;
    this.user.ask_change_pwd = false;
    this.user.ask_change_info = false;
    this.user.email = this.user.username;
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
  }

  updatePassword = () => {
    this.secondaryApp.auth().currentUser.updatePassword(this.password).then(res => {
      this.secondaryApp.auth().signOut();
      this.updateInfo();
    }).catch(err => {
      this.editing = false;
      console.log(err);
      this.errors = err.message;
    });
  }

  backToLogin = () => {
    this._authService._logOut().then(res => {
      this.closeDialog();
      this._authService._clear();
      this._router.navigate(['login']);
    });
  }
}
