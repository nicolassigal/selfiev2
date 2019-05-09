import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  stock = [];
  customers = [];
  warehouses = [];
  couriers = [];
  delivered = [];
  awbs = [];
  status = [];
  roles = [];

  stockSubject: Subject <any> = new Subject<any>();
  customerSubject: Subject <any> = new Subject<any>();
  warehouseSubject: Subject <any> = new Subject<any>();
  couriersSubject: Subject <any> = new Subject<any>();
  awbsSubject: Subject <any> = new Subject<any>();
  deliveredSubject: Subject <any> = new Subject<any>();
  statusSubject: Subject <any> = new Subject<any>();
  rolesSubject: Subject <any> = new Subject<any>();
  
  constructor() { }

  setStock = (stock) => {
    this.stock = stock;
    this.stockSubject.next(this.stock);
  };

  getStock = () => this.stock;

  setCustomers = (customers) => {
    this.customers = customers;
    this.customerSubject.next(this.customers);
  };

  getCustomers = () => this.customers;
  
  setWarehouses = (warehouses) => { 
    this.warehouses = warehouses;
    this.warehouseSubject.next(this.warehouses);
  };

  getWarehouses = () => this.warehouses;
  
  setCouriers = (couriers) => {
    this.couriers = couriers;
    this.couriersSubject.next(this.couriers);
  };

  getCouriers = () => this.couriers;

  setAwbs = (awbs) => {
    this.awbs = awbs;
    this.awbsSubject.next(awbs);
  };
  
  getAwbs = () => this.awbs;

  setDelivered = (delivered) => {
    this.delivered = delivered;
    this.deliveredSubject.next(delivered);
  };
  
  getDelivered = () => this.delivered;

  setStatus = (status) => {
    this.status = status;
    this.statusSubject.next(status);
  };
  
  getStatus = () => this.status;

  setRoles = (roles) => {
    this.roles = roles;
    this.rolesSubject.next(roles);
  };

  getCustomerById = (id) => {
    return this.customers.find(customer => customer.id === id);
  }

  getWarehouseById = (id) => {
    return this.warehouses.find(warehouse => warehouse.id === id);
  }
  
  getRoles = () => this.roles;
}
