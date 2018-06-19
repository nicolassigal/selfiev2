import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router,
    private auth: AngularFireAuth,
    private _db: AngularFirestore) { }
  token;
  _setToken = (token) => {
    localStorage.setItem('token', token);
    this.token = token;
  }

  _getToken = () => {
    return this.token || localStorage.getItem('token');
  }

  _isAuthenticated = () => {
    return this._getToken() !== null;
  }

  _isAuthorized = (state) => {
    this.auth.user.subscribe(data => {
      this._db.collection('users').valueChanges()
      .pipe(take(1))
      .subscribe(users => {
        let authLevel = users.filter(user => user.username === data.email)[0].role;
        console.log(authLevel, state);
      });
    });
  }

  _clear = () => {
    sessionStorage.clear();
    localStorage.clear();
    this.token = null;
  }

  _logOut = () => {
    return this.auth.auth.signOut();
  }
}
