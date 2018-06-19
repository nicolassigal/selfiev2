import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { TableService } from '../../shared/hbr-table/table.service';

@Component({
  selector: 'app-couriers',
  templateUrl: './couriers.component.html',
  styleUrls: ['./couriers.component.scss']
})
export class CouriersComponent implements OnInit {
  loadingData = false;
  data;
  cols = [
    { columnDef: 'actions', header: 'Actions', type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'Id', type: '', cell: (element) => `${element.id}` },
    { columnDef: 'name', header: 'Name', type: '', cell: (element) => `${element.name ? element.name : ''}` }
  ];
  constructor(private _db: AngularFirestore, private tbService: TableService) { }

  ngOnInit() {
    this._db.collection('couriers', ref => ref.orderBy('id', 'asc'))
      .valueChanges()
      .subscribe(data => {
        this.data = data;
        this.data.map(row => row.name = this.capitalizeText(row.name));
        this.tbService.dataSubject.next(this.data);
      });
  }

  capitalizeText = (text) => {
    if (text !== null && text !== undefined && typeof text === 'string') {
      return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })).join(' ');
    }
  }
}
