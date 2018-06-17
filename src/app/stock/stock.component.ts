import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MAT_AUTOCOMPLETE_VALUE_ACCESSOR } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { WorkersService } from '../workers.service';
import { InfoService } from '../info/info.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { TableService } from '../shared/hbr-table/table.service';
import { saveAs } from 'file-saver';
import { SendStockDialogComponent } from './dialogs/send-stock/send-stock.component';
import { EditStockDialogComponent } from './dialogs/edit-stock/edit-stock.component';
import * as _moment from 'moment';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  loadingData = false;
  data;
  fileUploader = '';
  moment = _moment;
  customers = [];
  couriers = [];
  isMakingChangesOnData = false;
  cols = [
    { columnDef: 'actions', header: 'Actions', type: '', showSendStock: true, cell: (element) => '' },
    { columnDef: 'hbr_id', header: 'Hbr id', type: '', cell: (element) => `${element.hbr_id}` },
    { columnDef: 'warehouse', header: 'Warehouse', type: '', cell: (element) => `${element.warehouse ? element.warehouse : ''}` },
    { columnDef: 'box_qty', header: 'Box qty.', type: '', cell: (element) => `${element.box_qty ? element.box_qty : 0}` },
    { columnDef: 'total_weight', header: 'Total Weight', type: 'weight', cell: (element) => `${element.total_weight ? element.total_weight : 0}` },
    { columnDef: 'total_value', header: 'Total Value', type: 'value', cell: (element) => `${element.total_value ? element.total_value : 0}` },
    { columnDef: 'description', header: 'Description', type: '', cell: (element) => `${element.description ? element.description : ''}` },
    { columnDef: 'customer', header: 'Customer', type: '', cell: (element) => `${element.customer ? element.customer : ''}` },
    { columnDef: 'date', header: 'WH In date', type: 'date', cell: (element) => `${element.date ? element.date : ''}` },
  ];

  constructor(
    private _worker: WorkersService,
    private infoService: InfoService,
    private _db: AngularFirestore,
    private _tableService: TableService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this.loadingData = true;
    this._db.collection('users').valueChanges().subscribe(users => this.customers = users);
    this._db.collection('couriers').valueChanges().subscribe(couriers => this.couriers = couriers);
    this._db.collection('operations', ref => ref.orderBy('hbr_id', 'desc'))
      .valueChanges()
      .subscribe(data => {
        this.loadingData = false;
        this.data = data;
        if (!this.isMakingChangesOnData) {
          this._tableService.dataSubject.next(this.data);
        }
      });
    this._tableService.editRowSubject.subscribe(row => this.editRow(row));
    this._tableService.deleteRowSubject.subscribe(row => this.deleteRow(row));
    this._tableService.sendBoxesSubject.subscribe(row => this.sendStock(row));
  }

  parseXLS = (evt: any) => {
    if (evt.target.files) {
      const target: DataTransfer = <DataTransfer>(evt.target);
      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const msgToWorker = {
          url: `${document.location.protocol}//${document.location.host}`,
          msg: 'Start Worker',
          bstr: bstr
        };

        this.infoService.showMessage(`<ul><li><p>Getting data... Please Wait</p></li></ul>`);

        this._worker.createWorker(this._worker.getXlsxWorker());
        this._worker.postMessageToWorker(msgToWorker);
        this._worker.worker.addEventListener('message', (response) => {
          this.infoService.showMessage(`<ul><li><p>Getting data... Finished </p></li></ul>`);
          this._worker.terminateWorker();
          this.prepareData(this.data, JSON.parse(response.data));
        });
      };

      reader.readAsBinaryString(target.files[0]);
    }
  }

  prepareData = (data, xls) => {
    const msgToWorker = { msg: 'Start Worker', xlsData: xls, dbData: data };
    this.infoService.showMessage(`
    <ul>
      <li><p>Getting data... Finished </p></li>
      <li><p>Preparing data... Please wait </p></li>
    </ul>
    `);

    this._worker.createWorker(this._worker.getUniqueDBWorker());
    this._worker.postMessageToWorker(msgToWorker);
    this._worker.worker.addEventListener('message', (response) => {
      this._worker.terminateWorker();
      const result = JSON.parse(response.data);
      if (result.length) {
        this.addEntry(result);
      } else {
        this.infoService.showMessage(`
        <ul>
          <li><p>Getting data... Finished </p></li>
          <li><p>Preparing data... Finished </p></li>
          <li><p>Nothing to update. </p></li>
        </ul>
        `);
        setTimeout(this.finishProccesing, 3000);
      }
    });
  }

  addEntry = (data) => {
    const promiseArr = [];
    this.infoService.showMessage(`
    <ul>
      <li><p>Getting data... Finished </p></li>
      <li><p>Preparing data... Finished </p></li>
      <li><p>Updating ${data.length} new entries... please wait </p></li>
    </ul>
    `);

    let newCustomers = [];
    let newCouriers = [];
    data.map(row => {
      let rowCustomer = row.customer ? row.customer.toLowerCase().trim() : null;
      let rowCourier = row.courier ? row.courier.toLowerCase().trim() : null;
      if (!this.couriers.some(courier => courier.name.toLowerCase().trim() === rowCourier)) {
        if (rowCourier && rowCourier.length) {
          let id = this.getId(this.couriers);
          let courierToAdd = {
             id: id, 
             name: rowCourier.toUpperCase()
             };
          if (!newCouriers.some(e => e.id === courierToAdd.id)) {
            row.courier_id = courierToAdd.id;
            newCouriers.push(courierToAdd);
          }
        }
      } else {
        if (!row.courier_id) {
          row.courier_id = this.couriers.filter(courier => courier.name.toLowerCase().trim() === rowCourier)[0].id;
        }
      }
      if (!this.customers.some(customer => customer.name.toLowerCase().trim() === rowCustomer)) {
        if (rowCustomer && rowCustomer.length) {
          let id = this.getId(this.customers);
          let customerToAdd = {
             id: id, 
             name: this.capitalizeText(rowCustomer),
             products: null,
             cuit: null,
             tel: null,
             email: null,
             address: null,
             contact_name: null,
             country: null,
             city: null,
             username: null,
             password: null,
             deleted: null
             };
          if (!newCustomers.some(e => e.id === customerToAdd.id)) {
            row.customer_id = customerToAdd.id;
            newCustomers.push(customerToAdd);
          }
        }
      } else {
        if (!row.customer_id) {
          row.customer_id = this.customers.filter(customer => customer.name.toLowerCase().trim() === rowCustomer)[0].id;
        }
      }
    });

    let customerPromise = [];
    let courierPromise = [];
    newCustomers.map(customer => {
      if (customer) {
        customerPromise.push(this._db.collection('users').doc(`${this.getId(this.customers)}`).set(customer))
      }
    });
    newCouriers.map(courier => {
      if (courier) {
        courierPromise.push(this._db.collection('couriers').doc(`${this.getId(this.couriers)}`).set(courier))
      }
    });
    Promise.all(customerPromise).then(res => console.log(res)).catch(err => console.log(err));
    data.map(entry => {
      entry.hbr_id = !isNaN(entry.hbr_id) ? Number(entry.hbr_id) : null;
      entry.box_qty = !isNaN(entry.box_qty) ? Number(entry.box_qty) : null;
      entry.total_value = !isNaN(entry.total_value) ? Number(entry.total_value) : null;
      entry.total_weight = !isNaN(entry.total_weight) ? Number(entry.total_weight) : null;
      entry.customer = entry.customer && entry.customer.length ? this.capitalizeText(entry.customer) : null;
      entry.warehouse = entry.warehouse && entry.warehouse.length ? this.capitalizeText(entry.warehouse) : null;
      entry.courier = entry.courier && entry.courier.length ? this.capitalizeText(entry.courier) : null;
      entry.date = entry.date && this.moment(entry.date, "DD-MM-YYYY").isValid() ? this.moment(entry.date).unix() : null;
      if (entry.hbr_id) {
        promiseArr.push(this._db.collection('operations').doc(`${entry.hbr_id}`).set(entry));
      }
    });
    this.isMakingChangesOnData = true;
    Promise.all(promiseArr)
      .then(res => console.log(res))
      .then(() => {
        this.infoService.showMessage(`
        <ul>
          <li><p>Getting data... Finished </p></li>
          <li><p>Preparing data... Finished </p></li>
          <li><p>Updating ${data.length} new entries... Finished</p></li>
        </ul>
        `);
        this.finishProccesing();
        this._tableService.dataSubject.next(this.data);
        this.isMakingChangesOnData = true;
      })
      .catch(res => console.log(res));
  }

  finishProccesing = () => {
    this.fileUploader = '';
    setTimeout(this.infoService.hideMessage, 3000);
  }

  setFilterData = (data) => {
    this._tableService.filterSubject.next(data);
  }

  capitalizeText = (text) => {
    if (text !== null && text !== undefined && typeof text === 'string') {
      return text.split(' ').map(word => word.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      })).join(' ');
    }
  }

  users = () => {
    let users = [
      {
        "id": 5,
        "name": "taha",
        "products": "Cartas y juegos",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 9,
        "name": "chopera",
        "products": "Canillas Chopera",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 10,
        "name": "leo grataroli",
        "products": "Rep celulares",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 22,
        "name": "celilia katz",
        "products": "Make UP",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 23,
        "name": "florencia botti",
        "products": "merch Harry Poter",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 30,
        "name": "gaston buttini",
        "products": "Anime",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 35,
        "name": "cabo frio",
        "products": "filtros chopera",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 38,
        "name": "fundacion autismo",
        "products": "probioticos",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 39,
        "name": "talleres dinamarca",
        "products": "repuestos",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 42,
        "name": "peter",
        "products": "Mascaras, Filtros",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 44,
        "name": "javier comicom",
        "products": "figuras",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 45,
        "name": "chris rock",
        "products": "discos",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 47,
        "name": "ezequiel figuras",
        "products": "Figuras",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 49,
        "name": "alejandra tello",
        "products": "Figuras",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 50,
        "name": "hero factory (santiago babarro)",
        "products": "Figuras",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 51,
        "name": "3d",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 52,
        "name": "gabriel caffese",
        "products": "VARIOS",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 53,
        "name": "facundo comic center",
        "products": "Comics",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 54,
        "name": "juan cafiero",
        "products": "CABLES",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 55,
        "name": "santiago dominissini",
        "products": "perq envios",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 101,
        "name": "luciana fischbach",
        "products": "VARIOS",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 102,
        "name": "fabricio marchese",
        "products": "bijou",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 103,
        "name": "german valverde",
        "products": "Figuras san isidro",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 104,
        "name": "roberto adrian de bellis",
        "products": "Pelo",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 105,
        "name": "lucas sanvitale",
        "products": "KIT de Figuras",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 106,
        "name": "santiago fariña",
        "products": "Discos y Tech",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 107,
        "name": "martin constantinides",
        "products": "Despa Varios",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 108,
        "name": "roque apocalipsis",
        "products": "figuras",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 109,
        "name": "santiago babarro",
        "products": "FIGURA",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 110,
        "name": "luis kausik",
        "products": "Discos y Tech",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 111,
        "name": "guillermo montes de oca",
        "products": "PS4",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 112,
        "name": "maxi choperas",
        "products": "choperas",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 113,
        "name": "liliana moretti",
        "products": "Peq envios",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 114,
        "name": "lucho socio leo roscow",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 115,
        "name": "rama",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 116,
        "name": "gabriel maximiliano perez/maximiliano cimino",
        "products": "peq envios",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 117,
        "name": "gumarqui",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 118,
        "name": "nati muebles banco",
        "products": "muebles",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 119,
        "name": "pompiglio salviani",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 120,
        "name": "pablo choperas bariloche",
        "products": "Choperas",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 121,
        "name": "expocomex",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 122,
        "name": "leo van der molen",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 123,
        "name": "martin corvalan",
        "products": "Discos LP",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 124,
        "name": "pablo bariloche",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 125,
        "name": "juan litwin",
        "products": "ropa peq envios",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 126,
        "name": "cristian fuentes",
        "products": "vinilos",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 127,
        "name": "josé luis martínez",
        "products": "ropa peq envios",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 128,
        "name": "natalia laborde",
        "products": "ropa peq envios",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 129,
        "name": "facundo mena",
        "products": "FIGURAS",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 130,
        "name": "ricky duaygues",
        "products": "VARIOS",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 131,
        "name": "constanza cragnolino",
        "products": "MAKE UP",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 132,
        "name": "ezequiel de boedo",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 133,
        "name": "matias y fali",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 134,
        "name": "juan moretti",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 135,
        "name": "hbr",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 136,
        "name": "marianella",
        "products": "Varios",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 137,
        "name": "luciana fishbach",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 138,
        "name": "miguel pugliese",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 139,
        "name": "roque alejandro rios",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 140,
        "name": "luis kausic",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 141,
        "name": "mario delicio",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 142,
        "name": "daniel vosgirdas",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 143,
        "name": "brett ericksen",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 144,
        "name": "martin alej bliccharski",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 145,
        "name": "cecilia katz",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 146,
        "name": "javier alejandro sebastian",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 147,
        "name": "gustavo manini",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 148,
        "name": "luciano aparicio",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 149,
        "name": "industrias darc",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 150,
        "name": "emiliano salviani",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 151,
        "name": "hbr/cabo de frio",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 152,
        "name": "gonzalo garcia",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 153,
        "name": "farina",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 154,
        "name": "grattaroli",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 155,
        "name": "fernando gonzalez",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 156,
        "name": "maxi kumky",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 157,
        "name": "santiago mena",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 158,
        "name": "juan andres litwin",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 159,
        "name": "santiago lloret/ alvareez",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 160,
        "name": "jose luis martinez",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 161,
        "name": "christian martin fuentes",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 162,
        "name": "silvana moretti",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 163,
        "name": "hbr131",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 164,
        "name": "hbr 131",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 165,
        "name": "hbr22/florencia paula botti",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 166,
        "name": "gomez angel miguel",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 167,
        "name": "gisela bravo",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 168,
        "name": "juan costa",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 169,
        "name": "matias suarez",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 170,
        "name": "cristina maria simao",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 171,
        "name": "muriel gloria ferreyra",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 172,
        "name": "adrian pablo lioe",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 173,
        "name": "rafael suarez",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 174,
        "name": "micaela salvador",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 175,
        "name": "adrian pablo lio",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 176,
        "name": "david haiy",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 177,
        "name": "juan cortes",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 178,
        "name": "ester anse",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 179,
        "name": "agustin manzitti/guillermo",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 180,
        "name": "omega naval s.a.",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 181,
        "name": "santiago babarro (victor mariani)",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      },
      {
        "id": 182,
        "name": "julio di vita",
        "products": "",
        "cuit": "",
        "tel": "",
        "email": "",
        "address": "",
        "contact_name": "",
        "country": "",
        "city": "",
        "username": "",
        "password": "",
        "deleted": ""
      }
    ];
    let p = [];
    users.map(user => p.push(this._db.collection('users').doc(`${user.id}`).set(user)));
    Promise.all(p).then(res => console.log(res));
  }

  download = () => {
    let ordered = JSON.parse(JSON.stringify(this.data));
    ordered.map(row => row.date = row.date ? this.moment.unix(row.date).format("DD-MM-YYYY") : null);
    const worksheet: any = XLSX.utils.json_to_sheet(ordered.sort((row1, row2) => Number(row1.hbr_id) - Number(row2.hbr_id)), {
      header: [
        'hbr_id',
        'wh_id',
        'warehouse',
        'courier_id',
        'courier',
        'customer_id',
        'customer',
        'contact_name',
        'cuit',
        'email',
        'tel',
        'address',
        'city',
        'country',
        'date',
        'description',
        'destination',
        'proforma',
        'shipping_date',
        'box_qty',
        'total_value',
        'total_weight',
        'tracking'
      ]
    });
    const workbook: any = { Sheets: { 'stock': worksheet }, SheetNames: ['stock'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    saveAs(new Blob([this.s2ab(excelBuffer)], { type: 'application/octet-stream' }), 'stock.xlsx');
  }

  s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  private getId = (data) => {
    let maxid = 0;
    data.map(e => {
      if (e.id > maxid) {
        maxid = e.id;
      }
    })
    return maxid + 1;
  }

  editRow = (row) => {
    this._dialog.open(EditStockDialogComponent, {
      data: {
        row: row,
        title: 'Edit Operation',
        confirmBtn: 'Save',
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
  }

  deleteRow = (row) => {
    this._dialog.open(EditStockDialogComponent, {
      data: {
        row: row,
        title: 'Delete Operation',
        confirmBtn: 'Delete',
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
  }

  sendStock = (row) => {
    this._dialog.open(SendStockDialogComponent, {
      data: {
        row: row,
        title: 'Send Boxes',
        confirmBtn: 'Send',
        cancelBtn: 'Cancel'
      }, width: '500px'
    })
  }
}