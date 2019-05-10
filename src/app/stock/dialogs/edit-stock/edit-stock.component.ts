import { DataService } from './../../../shared/data.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as _moment from 'moment';
import { take } from 'rxjs/operators';
import { UtilsService } from '../../../shared/utils.service';

@Component({
    templateUrl: './edit-stock.component.html',
    styleUrls: ['./../dialog.component.scss']
  })
  export class EditStockDialogComponent implements OnInit {
    warehouses = [];
    customers = [];
    operations = [];
    couriers = [];
    isEditing = false;
    box = {
      id: null,
      date: null,
      hbr_id: null,
      checked: false,
      wh_id: null,
      warehouse: null,
      customer_id: null,
      courier_id: null,
      customer: null,
      box_qty: null,
      initial_qty: null,
      total_weight: null,
      profit: null,
      description: null,
      deleted: 0,
      delivered: 0,
      tracking: '',
      wr0: null,
      dest_type: '',
      entry_point: {name:'',id:''}
     };
    moment = _moment;
    constructor(
      private _dialogRef: MatDialogRef<any>,
      private _dialog: MatDialog,
      private _db: AngularFirestore,
      private _dataService: DataService,
      private _utils: UtilsService,
      @Inject(MAT_DIALOG_DATA) public data: any) {}


    ngOnInit() {
      this.box = {...this.box, ...this.data.row };
      this.box.courier_id = Number(this.box.courier_id);
      this.box.wh_id = Number(this.box.wh_id);
      this.box.customer_id = Number(this.box.customer_id);
      this.customers = this.data.customers.sort((a, b) => a.name.localeCompare(b.name));
      this.warehouses = this.data.warehouses.sort((a, b) => a.name.localeCompare(b.name));
      this.couriers = this.data.couriers.sort((a, b) => a.name.localeCompare(b.name));
      this.box.date = this.box.date ? this.moment.unix(this.box.date).format('YYYY-MM-DD') : this.moment().format('YYYY-MM-DD');
      this.operations = this._dataService.getStock();
    }

    update = () => {
      this.isEditing = true;
      this.box.checked = false;
      this.box.date = this.box.date ? this.moment(this.box.date).unix() : null;
      this.box.warehouse = this.box.wh_id ? this.warehouses.filter(wh => wh.id === this.box.wh_id)[0].name : null;
      this.box.entry_point = {name: this.box.warehouse, id: this.box.wh_id};
      this.box.dest_type = this.box.dest_type.length ? this.box.dest_type : "Warehouse";
      this.box.customer = this.box.customer_id ? this.customers.filter(customer => customer.id === this.box.customer_id)[0].name : null;
      if (!this.box.id) {
        this.box.id = this._utils.getId(this.operations);
        this.box.deleted = 0;
        this.box.delivered = 0;
        this.box.initial_qty = this.box.box_qty;
      }

      this.box.hbr_id = this.operations.length ? Number(this.operations[0].hbr_id) + 1 : 1;
      this._db.collection('operations')
        .doc(`${this.box.id}`)
        .set(this.box)
        .then(res => {
          this.isEditing = false;
          this._dialogRef.close();
        })
        .catch(err => console.log(err));
    }

    public closeDialog() {
      this._dialogRef.close();
    }
  }
