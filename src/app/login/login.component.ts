import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { element } from 'protractor';
import { AngularFirestore } from 'angularfire2/firestore';
import { take } from 'rxjs/operators';
import { UtilsService } from '../shared/utils.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loggingin = false;
  registering = false;
  registered = false;
  loginFormActive = true;
  error;
  email;
  password;
  password2;
  users = [];
  user = {
    name: null,
    email: null,
    username: null,
    cuit: null,
    address: null,
    city: null,
    country: null,
    tel: null,
    role: 0,
    id: null
  };

  constructor(private auth: AngularFireAuth,
    private router: Router,
    private _db: AngularFirestore,
    private authService: AuthService,
    private _utils: UtilsService) { }

  ngOnInit() {
    this.error = '';
    this._db.collection('users').valueChanges()
    .pipe(take(1)).subscribe(users => this.users = users);
    if (this.authService._isAuthenticated()) {
      this.router.navigate(['dashboard']);
    }
  }

  login  = () => {
    if (this.email && this.password) {
      this.loggingin = true;
      this.auth.auth.signInWithEmailAndPassword(this.email, this.password)
      .then(res => {
        this.loggingin = false;
        this.error = '';
        firebase.auth().currentUser.getIdToken().then(token => {
          this.authService._setToken(token);
        });
        this.router.navigate(['dashboard']);
      })
      .catch(err => this.handleErrors(err.code));
    } else {
      this.error = 'You must provide an username/password';
    }
  }

  switchTo = () => {
    this.user = {
      name: null,
      email: null,
      username: null,
      cuit: null,
      address: null,
      city: null,
      country: null,
      tel: null,
      role: 0,
      id: null
    };
    this.loginFormActive = !this.loginFormActive;
    this.email = '';
    this.password = '';
    this.password2 = '';
    this.error = '';
  }

  register  = () => {
    if (this.email && this.password && this.password2) {
      if (this.password === this.password2) {
        this.registering = true;
        this.auth.auth.createUserWithEmailAndPassword(this.email, this.password)
        .then(res => {
            this.user.email = this.email;
            this.user.id = this._utils.getId(this.users);
            this._db.collection('users').doc(`${this.user.id}`).set(this.user)
            .then(() => {
              this.loggingin = false;
              this.error = '';
              this.registering = false;
              this.registered = true;
            }).catch(err => console.log(err));
        }).catch(err => this.handleErrors(err));
      } else {
        this.error = 'Passwords doesnt match';
      }
    } else {
      this.error = 'You must provide an username/password';
    }
  }

  navToRegister = () => {
    this.router.navigate(['register']);
  }

  handleErrors = (e) => {
    this.loggingin = false;
    this.registering = false;
    switch (e.code) {
      case 'auth/invalid-email':
        this.error = 'Please enter a valid E-mail';
        break;
      case 'auth/email-already-in-use':
        this.error = 'E-mail already exists';
        break;
      case 'auth/weak-password':
        this.error = 'Password should be at least 6 characters';
        break;
      case 'auth/user-not-found':
        this.error = 'Please enter a valid username/password';
        break;
      default:
        this.error = 'Please enter a valid username/password';
        break;
    }
  }
}