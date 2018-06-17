import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  filterSubject: Subject<any> = new Subject<any>();
  dataSubject: Subject<any> = new Subject<any>();
  editRowSubject: Subject<any> = new Subject<any>();
  deleteRowSubject: Subject<any> = new Subject<any>();
  sendBoxesSubject: Subject<any> = new Subject<any>();
}
