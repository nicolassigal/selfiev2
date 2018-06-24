import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router, ActivationEnd } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { take, filter } from 'rxjs/operators';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class AuthService {
  token;
  addUserUrl: string = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyDn7dXf3KGRjVwjSV3dNYMbe9ZhoHoPy6k';
  deleteUserUrl: string = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/deleteAccount?key=AIzaSyDn7dXf3KGRjVwjSV3dNYMbe9ZhoHoPy6k';
  constructor(private router: Router,
    private auth: AngularFireAuth,
    private _http: Http,
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

  _addUser = (email, password) => {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    let body = { 'email':email, 'password':password, 'returnSecureToken': true};

    return this._http.post(this.addUserUrl, body, options)
  }

  _deleteUser = (localId) => {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    let body = { 'localId': 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYyMDg0NmQxNDVjN2VjNjQ0ODU5MmFjZWYzMGVhYmE1NzA4NmMwYWUifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2VsZmllLTMzMmRmIiwiYXVkIjoic2VsZmllLTMzMmRmIiwiYXV0aF90aW1lIjoxNTI5Njc0NzYwLCJ1c2VyX2lkIjoiVzJnT1JLeXo1T1F1dEZwaFMxcXc2c2VIRk5OMiIsInN1YiI6IlcyZ09SS3l6NU9RdXRGcGhTMXF3NnNlSEZOTjIiLCJpYXQiOjE1Mjk2NzQ3NjAsImV4cCI6MTUyOTY3ODM2MCwiZW1haWwiOiJkZWxldGVAZGVsZXRlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJkZWxldGVAZGVsZXRlLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.nUbgJYxaeW9tSSe_TsYhP66-s6t9sI0ePkr-PIVHSQqN_9wr3hJGHjI7yCaupxvkdbdVUZExuBOBxXXM6qJFpT2w-ZLAY0OlScQXwI_CCE5l_-qZCcEJ0fuBd2gBnmFqA4eD0gqLM53c4Ftjy3WRQjomLF6aAYXvRjZ2iDTo-5GOgDSIp-xU6gOER2x1I9K019kUyCvkfAVIVt1GxaTwN5qa72rnzW1ICm-5ktJHk_AjOYdXdV65pJb8nCuyySteO2UJZWVPWYx4g95hx-8qbPAcB-cgWCI7v0y2qngNS3YDgE-cXfR1XrYvh1y0YpxkPhuIEa859ufFVV_6BunMdg'};
    return this._http.post(this.deleteUserUrl, body, options);
  }
}
