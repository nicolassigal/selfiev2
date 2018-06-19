import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { TableService } from '../../shared/hbr-table/table.service';

@Component({
  selector: 'app-warehouses',
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.scss']
})
export class WarehousesComponent implements OnInit {
  loadingData = false;
  data;
  cols = [
    { columnDef: 'actions', header: 'Actions', type: '', cell: (element) => `${element.actions}` },
    { columnDef: 'id', header: 'Id', type: '', cell: (element) => `${element.id}` },
    { columnDef: 'name', header: 'Name', type: '', cell: (element) => `${element.name ? element.name : ''}` },
    { columnDef: 'tel', header: 'Phone', type: '', cell: (element) => `${element.tel ? element.tel : ''}` },
    { columnDef: 'address', header: 'Address', type: '', cell: (element) => `${element.address ? element.address : ''}` },
    { columnDef: 'city', header: 'City', type: '', cell: (element) => `${element.city ? element.city : ''}` },
    { columnDef: 'country', header: 'Country', type: '', cell: (element) => `${element.country ? element.country : ''}` },
    { columnDef: 'username', header: 'Username', type: '', cell: (element) => `${element.username ? element.username : ''}` }
  ];
  constructor(private _db: AngularFirestore, private tbService: TableService) { }

  ngOnInit() {
    this._db.collection('warehouses', ref => ref.orderBy('id', 'asc'))
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
