import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router, ActivationEnd } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { take, filter } from 'rxjs/operators';

@Injectable()
export class AuthService {
  token;
  constructor(private router: Router,
    private auth: AngularFireAuth,
    private _db: AngularFirestore) { }

  _setToken = (token, role) => {
    token = `${token}${role}`;
    localStorage.setItem('token', token);
    this.token = token;
  }

  _getToken = () => {
    return this.token || localStorage.getItem('token');
  }

  _isAuthenticated = () => {
    return this._getToken() !== null;
  }

  _isAuthorized = (RequiredAuthLevel) => {
    if (RequiredAuthLevel.some(level => level === this.getRole())) {
      return true;
    }
  }

  getRole = () => {
    let token = this._getToken();
    return Number(token.charAt(token.length - 1));
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
