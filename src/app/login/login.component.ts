import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  user = { username: null, password: null };
  constructor(private auth: AngularFireAuth) { }

  ngOnInit() {
  }

  login  = () => {
    this.auth.auth.signInWithEmailAndPassword(this.user.username, this.user.password)
    .then(res => console.log(res))
    .catch(err => console.log(err));
  }
}
