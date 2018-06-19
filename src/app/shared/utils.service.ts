import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public getId = (data) => {
    let maxid = 0;
    data.map(e => {
      if (e.id > maxid) {
        maxid = e.id;
      }
    });

    return maxid + 1;
  }
}
