import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  filterSubject: Subject<any> = new Subject<any>();
  constructor() { }
}
