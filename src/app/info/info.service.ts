import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  infoSubject: Subject<any> = new Subject<any>();
  constructor() { }

  showMessage = (template) => {
    this.infoSubject.next(template);
  }

  hideMessage = () => {
    this.infoSubject.next();
  }
}
