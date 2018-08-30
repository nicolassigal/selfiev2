import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import * as firebase from 'firebase/app';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  secondaryApp;

  ngOnInit() {
    sessionStorage.setItem('prod', JSON.stringify(environment.production));
    if (!this.secondaryApp) {
      this.secondaryApp = firebase.initializeApp(environment.firebase, 'Secondary');
    }
  }
}
