import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  title = '';
  titleSubject: Subject<any> = new Subject<any>();
  constructor() { }

  setTitle = (title) => {
    this.titleSubject.next(title);
  }

  getTitle = () => this.title;
}
