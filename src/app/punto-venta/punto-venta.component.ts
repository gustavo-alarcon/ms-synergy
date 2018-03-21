import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ClientsComponent } from './clients/clients.component';
import { PaymentComponent } from './payment/payment.component';
import { trigger, state, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { ListCustomers } from '../classes/listCustomers';
import { PosService } from '../servicios/pos.service';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.css'],
  animations: [
    trigger('cardProduct', [
      transition(':enter', animate('700ms ease-in', keyframes([
        style({ opacity: 0, transform: 'translateY(-80%)', offset: 0 }),
        style({ opacity: 1, transform: 'translateY(35px)', offset: 0.5 }),
        style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 }),
      ]))),
      transition(':leave', animate('400ms ease-in', keyframes([
        style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
        style({ opacity: 0.5, transform: 'translateY(25px)', offset: 0.3 }),
        style({ opacity: 0, transform: 'translateX(-1000px)', offset: 1 }),
      ])))
    ]),
    trigger('totalTaxes', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(500),
      ]),
    ]),
    trigger('fadeList', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(300),
      ]),
    ]),
    trigger('images', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(900),
      ]),
    ]),
    trigger('tab', [
      transition(':enter', animate('700ms ease-in', keyframes([
        style({ opacity: 0, transform: 'translateX(100px)', offset: 0 }),
        style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 }),
      ])))
    ]),
    trigger('menuInOut', [
      state('close', style({ opacity: 0, display: 'none' })),
      transition('close => open', animate('500ms ease-in', keyframes([
        style({ display: 'block', opacity: 0, offset: 0 }),
        style({ opacity: 0.5, offset: 0.5 }),
        style({ opacity: 1, offset: 1.0 }),
      ]))),
      transition('open => close', animate('500ms ease-in', keyframes([
        style({ opacity: 1, offset: 0 }),
        style({ opacity: 0.5, offset: 0.5 }),
        style({ opacity: 0, display: 'none', offset: 1.0 }),
      ]))),
    ])
  ]
})

export class PuntoVentaComponent implements OnInit {
  selectedIndex: any;
  clicked = false;
  almacenes: any[] = [];
  documentos: any[] = [];
  productos_filtrado: any[] = [];
  pack_nombre: any[] = [];
  productos: any[] = [];
  paquetes_filtrado: any[] = [];
  paquetes: any[] = [];
  filteredOptions: any[];
  movimientoForm: FormGroup;
  filteredPackages: string[];
  tabNumber: number = 1;
  selectedWarehouse: string = '';
  productsOrPackages: number = 0;
  optionDisplay: number = 1;
  disabledToogle = false;
  listCustomers: ListCustomers[] = [];
  currentCustomer: number = 0;
  lastItemClicked: number = null;
  changeItemClicked: number = null;
  checked: boolean;
  operationOption: number = 1;
  igvType: number = 1;
  numerosSerie: any[];
  hideProducts: boolean = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'), 'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  nameBytes = crypto.AES.decrypt(localStorage.getItem('user'), 'meraki');
  user = this.nameBytes.toString(crypto.enc.Utf8);
  client: FormControl;
  isLoadingResults = true;
  listBytes : any = null;
  list : any = null;
  tabBytes : any = null;
  tab : any = null;


  constructor(
    private posService: PosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {
    if (JSON.parse(localStorage.getItem('tab')) != null) {
      this.selectedIndex = JSON.parse(localStorage.getItem('tab'));
      this.currentCustomer = this.selectedIndex;
    }
      
    if (localStorage.getItem('list') == null) {
      this.listCustomers.push({
        listAction: [],
        total: 0,
        taxes: 0,
        subtotal: 0,
        lastItemClicked: null,
        client: { Nombre: 'Cliente' },
        igvType: 1,
        documento: null,
        serie: null,
        correlativo: null,
        given: null,
        change: null,
        paymentType: null,
        user: JSON.parse(this.user),
        date: null
      });
    }
    else {
      this.listBytes = crypto.AES.decrypt(localStorage.getItem('list'), 'meraki');;
      this.list = this.listBytes.toString(crypto.enc.Utf8);
      this.listCustomers = JSON.parse(this.list);
    }

    this.movimientoForm = this.fb.group({
      Producto: '',
      Paquete: ''
    });

    this.loadWarehouse();

    this.client = new FormControl({ value: this.listCustomers[this.currentCustomer].client.Nombre, disabled: true });
  }

  ngOnInit() {
  }

  loadWarehouse() {
    this.isLoadingResults = true;
    this.posService.getWarehouse(this.bd).subscribe(res => {
      this.almacenes = res.records;
      this.almacenes.sort(this.sortBy('Nombre'));
      this.getProductsBD();
    });
  }

  getProductsBD() {
    this.posService.getProducts(this.bd).subscribe(res => {
      this.productos = res.records;
      this.productos.sort(this.sortBy('Nombre'));
      this.getPackagesBD();
    });
  }

  getPackagesBD() {
    this.posService.getPackages(this.bd).subscribe(res => {
      this.isLoadingResults = false;
      this.paquetes = res.records;
      this.cd.markForCheck();
    });
  }

  onTabClick(e) {
    this.productsOrPackages = e.index;
    if (e.index == 1) {
      this.disabledToogle = !this.disabledToogle;
      this.checked = false;
      this.optionDisplay = 1;
    }
    else
      this.disabledToogle = !this.disabledToogle;
  }

  onSelectCustomer(e) {
    this.currentCustomer = e;
    this.client.patchValue(this.listCustomers[this.currentCustomer].client.Nombre);
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
    localStorage.setItem('list', list);
  }

  changeOperationType(i) {
    this.operationOption = i;
  }

  eraseCustomer(i) {
    if (this.listCustomers.length != 1) {
      this.listCustomers.splice(i, 1);
      this.currentCustomer = i - 1;
      this.selectedIndex = this.currentCustomer;
      localStorage.setItem('tab', JSON.stringify(this.selectedIndex));
      this.client.patchValue(this.listCustomers[this.currentCustomer].client.Nombre);
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
    localStorage.setItem('list', list);
  }

  clickProductList(i) {
    if (this.lastItemClicked == null) {
      this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[i].id;
    }
    else {
      this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[i].id;
    }
  }

  executeOperation(int) {
    if (this.listCustomers[this.currentCustomer].listAction.length != 0) {
      for (let i = 0; i < this.listCustomers[this.currentCustomer].listAction.length; i++) {
        if (this.listCustomers[this.currentCustomer].lastItemClicked == this.listCustomers[this.currentCustomer].listAction[i].id && this.operationOption == 1) {
          if (int != '.') {
            this.listCustomers[this.currentCustomer].listAction[i].units = this.listCustomers[this.currentCustomer].listAction[i].units + int;
            if (this.verifyValue(i)) {
              this.listCustomers[this.currentCustomer].listAction[i].price = (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].unitPrice)) * (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].units));
              this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
              if (this.listCustomers[this.currentCustomer].listAction[i].dsc != '') {
                this.listCustomers[this.currentCustomer].listAction[i].price = ((parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price)) * (100 - parseFloat(this.listCustomers[this.currentCustomer].listAction[i].dsc))) / 100;
                this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
              }
            }
            else
              this.listCustomers[this.currentCustomer].listAction[i].price = '';
            this.calculateTotalAndTaxes();
            let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
            localStorage.setItem('list', list);
            return;
          }
          else {
            let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
            localStorage.setItem('list', list);
            return;
          }
        }
        if (this.listCustomers[this.currentCustomer].lastItemClicked == this.listCustomers[this.currentCustomer].listAction[i].id && this.operationOption == 2) {
          if (this.listCustomers[this.currentCustomer].listAction[i].dsc == '100') { return; }
          if (int == '.') {
            for (let x = 0; x < this.listCustomers[this.currentCustomer].listAction[i].dsc.length; x++)
              if (this.listCustomers[this.currentCustomer].listAction[i].dsc[x] == '.') { return; }
          }
          this.listCustomers[this.currentCustomer].listAction[i].dsc = this.listCustomers[this.currentCustomer].listAction[i].dsc + int;
          if (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].dsc) > 100)
            this.listCustomers[this.currentCustomer].listAction[i].dsc = '100';
          if (this.listCustomers[this.currentCustomer].listAction[i].dsc != '' && this.listCustomers[this.currentCustomer].listAction[i].units != '' && this.listCustomers[this.currentCustomer].listAction[i].unitPrice != '') {
            if (this.listCustomers[this.currentCustomer].listAction[i].dsc[this.listCustomers[this.currentCustomer].listAction[i].dsc.length - 1] != '.') {
              this.listCustomers[this.currentCustomer].listAction[i].price = ((parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price)) * (100 - parseFloat(this.listCustomers[this.currentCustomer].listAction[i].dsc))) / 100;
              this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
            }
          }
          else
            this.listCustomers[this.currentCustomer].listAction[i].price = '';
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
          localStorage.setItem('list', list);
          return;
        }
        if (this.listCustomers[this.currentCustomer].lastItemClicked == this.listCustomers[this.currentCustomer].listAction[i].id && this.operationOption == 3) {
          if (int == '.') {
            for (let x = 0; x < this.listCustomers[this.currentCustomer].listAction[i].unitPrice.length; x++)
              if (this.listCustomers[this.currentCustomer].listAction[i].unitPrice[x] == '.') { return; }
          }
          this.listCustomers[this.currentCustomer].listAction[i].unitPrice = this.listCustomers[this.currentCustomer].listAction[i].unitPrice + int;
          if (this.verifyValue(i)) {
            if (this.listCustomers[this.currentCustomer].listAction[i].unitPrice[this.listCustomers[this.currentCustomer].listAction[i].unitPrice.length - 1] != '.') {
              this.listCustomers[this.currentCustomer].listAction[i].price = (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].unitPrice)) * (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].units));
              this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
              if (this.listCustomers[this.currentCustomer].listAction[i].dsc != '') {
                this.listCustomers[this.currentCustomer].listAction[i].price = ((parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price)) * (100 - parseFloat(this.listCustomers[this.currentCustomer].listAction[i].dsc))) / 100;
                this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
              }
            }
          }
          else
            this.listCustomers[this.currentCustomer].listAction[i].price = '';
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
          localStorage.setItem('list', list);
          return;
        }
      }
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
    localStorage.setItem('list', list);
  }

  calculateTotalAndTaxes() {
    this.listCustomers[this.currentCustomer].total = 0;
    this.listCustomers[this.currentCustomer].taxes = 0;
    this.listCustomers[this.currentCustomer].subtotal = 0;

    if (this.igvType == 1) {
      for (let i = 0; i < this.listCustomers[this.currentCustomer].listAction.length; i++) {
        this.listCustomers[this.currentCustomer].total += +(this.listCustomers[this.currentCustomer].listAction[i].price);
      }
      if (this.listCustomers[this.currentCustomer].total > 0) {
        this.listCustomers[this.currentCustomer].subtotal = (this.listCustomers[this.currentCustomer].total / 1.18);
        this.listCustomers[this.currentCustomer].taxes = this.listCustomers[this.currentCustomer].total - this.listCustomers[this.currentCustomer].subtotal;
      }
      this.listCustomers[this.currentCustomer].total = parseFloat(this.listCustomers[this.currentCustomer].total.toFixed(2));
      this.listCustomers[this.currentCustomer].taxes = parseFloat(this.listCustomers[this.currentCustomer].taxes.toFixed(2));
      this.listCustomers[this.currentCustomer].subtotal = parseFloat(this.listCustomers[this.currentCustomer].subtotal.toFixed(2));
    }

    if (this.igvType == 2) {
      for (let i = 0; i < this.listCustomers[this.currentCustomer].listAction.length; i++) {
        this.listCustomers[this.currentCustomer].total += +(this.listCustomers[this.currentCustomer].listAction[i].price);
      }
      if (this.listCustomers[this.currentCustomer].total > 0) {
        this.listCustomers[this.currentCustomer].subtotal = (this.listCustomers[this.currentCustomer].total);
        this.listCustomers[this.currentCustomer].total = (this.listCustomers[this.currentCustomer].total * 1.18);
        this.listCustomers[this.currentCustomer].taxes = this.listCustomers[this.currentCustomer].total - this.listCustomers[this.currentCustomer].subtotal;
      }
      this.listCustomers[this.currentCustomer].total = parseFloat(this.listCustomers[this.currentCustomer].total.toFixed(2));
      this.listCustomers[this.currentCustomer].taxes = parseFloat(this.listCustomers[this.currentCustomer].taxes.toFixed(2));
      this.listCustomers[this.currentCustomer].subtotal = parseFloat(this.listCustomers[this.currentCustomer].subtotal.toFixed(2));
    }

    if (this.igvType == 3) {
      for (let i = 0; i < this.listCustomers[this.currentCustomer].listAction.length; i++) {
        this.listCustomers[this.currentCustomer].total += +(this.listCustomers[this.currentCustomer].listAction[i].price);
      }
      this.listCustomers[this.currentCustomer].total = parseFloat(this.listCustomers[this.currentCustomer].total.toFixed(2));
    }
  }

  backspace() {
    if (this.listCustomers[this.currentCustomer].listAction.length != 0) {
      for (let i = 0; i < this.listCustomers[this.currentCustomer].listAction.length; i++) {
        if (this.listCustomers[this.currentCustomer].lastItemClicked == this.listCustomers[this.currentCustomer].listAction[i].id && this.operationOption == 1) {
          if (this.listCustomers[this.currentCustomer].listAction[i].units == '') {
            this.listCustomers[this.currentCustomer].listAction.splice(i, 1);
            if (this.listCustomers[this.currentCustomer].listAction.length > 1)
              this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[i - 1].id;
            else
              if (this.listCustomers[this.currentCustomer].listAction.length != 0)
                this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[0].id;
          }
          else {
            if (this.listCustomers[this.currentCustomer].listAction[i].units.length != 0) {
              this.listCustomers[this.currentCustomer].listAction[i].units = this.listCustomers[this.currentCustomer].listAction[i].units.slice(0, -1);
              if (this.verifyValue(i)) {
                if (this.listCustomers[this.currentCustomer].listAction[i].units[this.listCustomers[this.currentCustomer].listAction[i].units.length - 1] != '.') {
                  this.listCustomers[this.currentCustomer].listAction[i].price = (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].unitPrice) * (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].units)));
                  this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
                  if (this.listCustomers[this.currentCustomer].listAction[i].dsc != '') {
                    this.listCustomers[this.currentCustomer].listAction[i].price = ((parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price)) * (100 - parseFloat(this.listCustomers[this.currentCustomer].listAction[i].dsc))) / 100;
                    this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
                  }
                }
              }
              else {
                this.listCustomers[this.currentCustomer].listAction[i].price = '';
              }
            }
          }
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
          localStorage.setItem('list', list);
          return;
        }
        if (this.listCustomers[this.currentCustomer].lastItemClicked == this.listCustomers[this.currentCustomer].listAction[i].id && this.operationOption == 2) {
          if (this.listCustomers[this.currentCustomer].listAction[i].dsc == '') {
            this.listCustomers[this.currentCustomer].listAction.splice(i, 1);
            if (this.listCustomers[this.currentCustomer].listAction.length > 1)
              this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[i - 1].id;
            else
              if (this.listCustomers[this.currentCustomer].listAction.length != 0)
                this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[0].id;
          }
          else {
            if (this.listCustomers[this.currentCustomer].listAction[i].dsc.length != 0) {
              this.listCustomers[this.currentCustomer].listAction[i].dsc = this.listCustomers[this.currentCustomer].listAction[i].dsc.slice(0, -1);
              if (this.verifyValue(i)) {
                this.listCustomers[this.currentCustomer].listAction[i].price = (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].unitPrice)) * (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].units));
                this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
                if (this.listCustomers[this.currentCustomer].listAction[i].dsc != '') {
                  if (this.listCustomers[this.currentCustomer].listAction[i].dsc[this.listCustomers[this.currentCustomer].listAction[i].dsc.length - 1] != '.') {
                    this.listCustomers[this.currentCustomer].listAction[i].price = ((parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price)) * (100 - parseFloat(this.listCustomers[this.currentCustomer].listAction[i].dsc))) / 100;
                    this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
                  }
                }
              }
              else {
                this.listCustomers[this.currentCustomer].listAction[i].price = '';
              }
            }
          }
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
          localStorage.setItem('list', list);
          return;
        }
        if (this.listCustomers[this.currentCustomer].lastItemClicked == this.listCustomers[this.currentCustomer].listAction[i].id && this.operationOption == 3) {
          if (this.listCustomers[this.currentCustomer].listAction[i].unitPrice == '') {
            this.listCustomers[this.currentCustomer].listAction.splice(i, 1);
            if (this.listCustomers[this.currentCustomer].listAction.length > 1)
              this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[i - 1].id;
            else
              if (this.listCustomers[this.currentCustomer].listAction.length != 0)
                this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[0].id
          }
          else {
            if (this.listCustomers[this.currentCustomer].listAction[i].unitPrice.length != 0) {
              if (this.listCustomers[this.currentCustomer].listAction[i].unitPrice.length == 2 && this.listCustomers[this.currentCustomer].listAction[i].unitPrice[0] == '-') {
                this.listCustomers[this.currentCustomer].listAction[i].unitPrice = '';
              }
              else
                this.listCustomers[this.currentCustomer].listAction[i].unitPrice = this.listCustomers[this.currentCustomer].listAction[i].unitPrice.slice(0, -1);
              if (this.verifyValue(i)) {
                if (this.listCustomers[this.currentCustomer].listAction[i].unitPrice[this.listCustomers[this.currentCustomer].listAction[i].unitPrice.length - 1] != '.') {
                  this.listCustomers[this.currentCustomer].listAction[i].price = (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].unitPrice) * (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].units)));
                  this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
                  if (this.listCustomers[this.currentCustomer].listAction[i].dsc != '') {
                    this.listCustomers[this.currentCustomer].listAction[i].price = ((parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price)) * (100 - parseFloat(this.listCustomers[this.currentCustomer].listAction[i].dsc))) / 100;
                    this.listCustomers[this.currentCustomer].listAction[i].price = parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price).toFixed(2);
                  }
                }
              }
              else {
                this.listCustomers[this.currentCustomer].listAction[i].price = '';
              }
            }
          }
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
          localStorage.setItem('list', list);
          return;
        }
      }
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
    localStorage.setItem('list', list);
  }

  verifyValue(i) {
    if (this.listCustomers[this.currentCustomer].listAction[i].units != '' && this.listCustomers[this.currentCustomer].listAction[i].unitPrice != '') {
      return true;
    }
    else
      return false;
  }

  addPlusOrNegative() {
    if (this.listCustomers[this.currentCustomer].listAction.length != 0) {
      for (let i = 0; i < this.listCustomers[this.currentCustomer].listAction.length; i++) {
        if (this.listCustomers[this.currentCustomer].lastItemClicked == this.listCustomers[this.currentCustomer].listAction[i].id) {
          if (this.listCustomers[this.currentCustomer].listAction[i].unitPrice != '') {
            if (this.listCustomers[this.currentCustomer].listAction[i].unitPrice[0] == '-')
              this.listCustomers[this.currentCustomer].listAction[i].unitPrice = this.listCustomers[this.currentCustomer].listAction[i].unitPrice.substr(1);
            else
              this.listCustomers[this.currentCustomer].listAction[i].unitPrice = '-' + this.listCustomers[this.currentCustomer].listAction[i].unitPrice;
          }
          if (this.verifyValue(i)) {
            this.listCustomers[this.currentCustomer].listAction[i].price = (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].unitPrice) * (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].units)));
            if (this.listCustomers[this.currentCustomer].listAction[i].dsc != '') {
              this.listCustomers[this.currentCustomer].listAction[i].price = (parseFloat(this.listCustomers[this.currentCustomer].listAction[i].price) * (100 - parseFloat(this.listCustomers[this.currentCustomer].listAction[i].dsc))) / 100;
            }
          }
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
          localStorage.setItem('list', list);
          return;
        }
      }
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
    localStorage.setItem('list', list);
  }

  changeIGVType() {
    this.calculateTotalAndTaxes();
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
    localStorage.setItem('list', list);
  }

  sortBy(key) {
    return function (a, b) {
      if (a[key] > b[key]) {
        return 1;
      } else if (a[key] < b[key]) {
        return -1;
      } []
      return 0;
    }
  }

  slideToogleChange(e) {
    if (e.checked) {
      this.optionDisplay = 2;
      this.checked = true;
    }
    else {
      this.optionDisplay = 1;
      this.checked = false;
    }
  }

  filtrarProductos(alm: string) {

    this.productos_filtrado = [];
    this.paquetes_filtrado = [];
    this.productos.forEach(element => {
      if (element['Zona'] === alm) {
        this.productos_filtrado.push(element);
      }
    });

    this.paquetes.forEach(element => {
      if (element['Almacen'] === alm) {
        this.paquetes_filtrado.push(element);
      }
    });
    let _nombre = '';
    let _position = 0;
    this.pack_nombre = [];
    for (let i = 0; i < this.paquetes_filtrado.length; i++) {
      if (this.paquetes_filtrado[i].Paquete != _nombre) {
        this.pack_nombre.push({
          'Nombre': this.paquetes_filtrado[i].Paquete,
          'Venta': this.paquetes_filtrado[i].Venta * this.paquetes_filtrado[i].Cantidad,
          'ID': this.paquetes_filtrado[i].ID,
          'Productos': []
        });
        this.pack_nombre[this.pack_nombre.length - 1].Productos.push({
          'nombre': this.paquetes_filtrado[i].Nombre,
          'precio': this.paquetes_filtrado[i].Venta,
          'cantidad': this.paquetes_filtrado[i].Cantidad,
          'id': this.paquetes_filtrado[i].IDProducto

        });
        _nombre = this.paquetes_filtrado[i].Paquete;
        _position = this.pack_nombre.length - 1;
      }
      else {
        this.pack_nombre[_position].Venta = parseFloat(this.pack_nombre[_position].Venta) + parseFloat(this.paquetes_filtrado[i].Venta);
        this.pack_nombre[_position].Productos.push({
          'nombre': this.paquetes_filtrado[i].Nombre,
          'precio': this.paquetes_filtrado[i].Venta,
          'cantidad': this.paquetes_filtrado[i].Cantidad,
          'id': this.paquetes_filtrado[i].IDProducto
        });
      }
    }
    this.filteredOptions = this.productos_filtrado;
    this.filteredPackages = this.pack_nombre;
  }

  pushKeyProducts() {
    this.filteredOptions = this.filterProducto(this.movimientoForm.value['Producto']);
  }

  pushKeyPackage() {
    this.filteredPackages = this.filterPackage(this.movimientoForm.value['Paquete']);
  }

  filterProducto(val): string[] {
    if (this.optionDisplay == 1) {
      return this.productos_filtrado.filter(option =>
        option.Nombre.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }
    else {
      return this.productos_filtrado.filter(option =>
        option.Codigo.toLowerCase().indexOf(val.toLowerCase()) === 0);
    }
  }

  filterPackage(val): string[] {
    return this.pack_nombre.filter(option =>
      option.Nombre.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  enterProduct() {
    let index;
    if (this.filteredOptions.length == 0)
      this.toastr.warning("No hay ningun producto", "Cuidado");
    else {
      if (this.filteredOptions.length == 1) {
        for (let i = 0; i < this.productos_filtrado.length; i++) {
          if (this.productos_filtrado[i].ID == this.filteredOptions[0].ID)
            index = i;
        }
        this.addToList(index);
      }
    }
    this.movimientoForm.reset();
    this.filteredOptions = this.productos_filtrado;
  }

  addCustomer() {
    this.listCustomers.push({
      listAction: [],
      total: 0,
      taxes: 0,
      subtotal: 0,
      lastItemClicked: null,
      client: { Nombre: 'Cliente' },
      igvType: 1,
      documento: null,
      serie: null,
      correlativo: null,
      given: null,
      change: null,
      paymentType: null,
      user: JSON.parse(this.user),
      date: null
    });
    this.currentCustomer = this.listCustomers.length - 1;
    this.client.patchValue(this.listCustomers[this.currentCustomer].client.Nombre);
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
    localStorage.setItem('list', list);
  }

  tabChanged(e) {
    if (e.index == this.listCustomers.length) {
      this.selectedIndex = this.listCustomers.length - 1;
    }
    localStorage.setItem('tab', JSON.stringify(this.selectedIndex));
  }

  addToList(i) {
    let alreadyIn = false;
    //Trabajo con productos
    if (this.productsOrPackages == 0) {
      for (let x = 0; x < this.listCustomers[this.currentCustomer].listAction.length; x++) {
        if (this.listCustomers[this.currentCustomer].listAction[x].id == this.productos_filtrado[i].Codigo)
          alreadyIn = true;
      }
      if (!alreadyIn) {
        this.listCustomers[this.currentCustomer].listAction.push({
          price: this.productos_filtrado[i].Venta,
          product: this.productos_filtrado[i].Nombre,
          units: '1',
          id: this.productos_filtrado[i].Codigo,
          dsc: '',
          unitPrice: '' + this.productos_filtrado[i].Venta,
          idReal: this.productos_filtrado[i].ID,
          package: 0,
          AlmacenOrigen: this.productos_filtrado[i].Zona,
          Cantidad: '1',
          Moneda: this.productos_filtrado[i].Moneda,
          Paquete: '',
          Producto: this.productos_filtrado[i].Nombre,
          IDProducto: this.productos_filtrado[i].ID,
          Unidad: this.productos_filtrado[i].Unidad,
          Venta: this.productos_filtrado[i].Venta,
        });
        this.listCustomers[this.currentCustomer].total += +(this.listCustomers[this.currentCustomer].listAction[this.listCustomers[this.currentCustomer].listAction.length - 1].price);
        this.listCustomers[this.currentCustomer].subtotal = (this.listCustomers[this.currentCustomer].total / 1.18);
        this.listCustomers[this.currentCustomer].taxes = this.listCustomers[this.currentCustomer].total - this.listCustomers[this.currentCustomer].subtotal;
        this.listCustomers[this.currentCustomer].lastItemClicked = this.productos_filtrado[i].Codigo;
        this.listCustomers[this.currentCustomer].total = parseFloat(this.listCustomers[this.currentCustomer].total.toFixed(2));
        this.listCustomers[this.currentCustomer].taxes = parseFloat(this.listCustomers[this.currentCustomer].taxes.toFixed(2));
        this.listCustomers[this.currentCustomer].subtotal = parseFloat(this.listCustomers[this.currentCustomer].subtotal.toFixed(2));

      }
      else {
        this.toastr.warning('El producto ya esta en la lista de venta, haga click en el para aumentar la cantidad', 'Cuidado');
      }
    }
    //Trabajo con paquetes
    else {
      for (let x = 0; x < this.listCustomers[this.currentCustomer].listAction.length; x++) {
        if (this.listCustomers[this.currentCustomer].listAction[x].id == this.pack_nombre[i].ID)
          alreadyIn = true;
      }
      if (!alreadyIn) {
        this.listCustomers[this.currentCustomer].listAction.push({
          price: this.pack_nombre[i].Venta,
          product: this.pack_nombre[i].Nombre,
          units: '1',
          id: this.pack_nombre[i].ID,
          dsc: '',
          unitPrice: '' + this.pack_nombre[i].Venta,
          products: this.pack_nombre[i].Productos,
          package: 1,
          AlmacenOrigen: this.pack_nombre[i].Almacen,
          Cantidad: '1',
          Moneda: this.pack_nombre[i].Moneda,
          Paquete: this.pack_nombre[i].Paquete,
          Producto: this.pack_nombre[i].Nombre,
          IDProducto: this.pack_nombre[i].IDProducto,
          Unidad: this.pack_nombre[i].Unidad,
          Venta: this.pack_nombre[i].Venta,
        });
        this.listCustomers[this.currentCustomer].total += +(this.listCustomers[this.currentCustomer].listAction[this.listCustomers[this.currentCustomer].listAction.length - 1].price);
        this.listCustomers[this.currentCustomer].subtotal = (this.listCustomers[this.currentCustomer].total / 1.18);
        this.listCustomers[this.currentCustomer].taxes = (this.listCustomers[this.currentCustomer].total * 18) / 100;
        this.listCustomers[this.currentCustomer].lastItemClicked = this.pack_nombre[i].ID;
        this.listCustomers[this.currentCustomer].total = parseFloat(this.listCustomers[this.currentCustomer].total.toFixed(2));
        this.listCustomers[this.currentCustomer].taxes = parseFloat(this.listCustomers[this.currentCustomer].taxes.toFixed(2));
        this.listCustomers[this.currentCustomer].subtotal = parseFloat(this.listCustomers[this.currentCustomer].subtotal.toFixed(2));
      }
      else {
        this.toastr.warning('El paquete ya esta en la lista de venta, haga click en el para aumentar la cantidad', 'Cuidado');
      }
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
    localStorage.setItem('list', list);
  }

  openClients() {
    let dialogRef = this.dialog.open(ClientsComponent, {
      width: 'auto',
      data: 'text',
      autoFocus: false
    });

    dialogRef.beforeClose().subscribe(result => {
      if (result != 'close' && result != undefined) {
        this.listCustomers[this.currentCustomer].client = result;
        this.client.patchValue(result.Nombre);
        let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
        localStorage.setItem('list', list);
      }
    });
  }

  openPayment() {
    if (this.listCustomers[this.currentCustomer].listAction.length != 0 && this.listCustomers[this.currentCustomer].client.Nombre != 'Cliente') {
      let dialogRef = this.dialog.open(PaymentComponent, {
        width: 'auto',
        data: this.listCustomers[this.currentCustomer],
        autoFocus: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (this.currentCustomer != 0) {
            this.listCustomers.splice(this.currentCustomer, 1);
            this.currentCustomer = this.currentCustomer - 1;
            this.selectedIndex = this.currentCustomer;
            localStorage.setItem('tab', JSON.stringify(this.selectedIndex));
          }
          else {
            this.listCustomers[this.currentCustomer].listAction = [];
            this.listCustomers[this.currentCustomer].total = 0,
              this.listCustomers[this.currentCustomer].taxes = 0,
              this.listCustomers[this.currentCustomer].subtotal = 0,
              this.listCustomers[this.currentCustomer].lastItemClicked = null,
              this.listCustomers.splice(0, 1);
            this.addCustomer()
          }
          this.cd.markForCheck();
          this.isLoadingResults = true;
          this.getAllProducts(this.selectedWarehouse);
          let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), 'meraki');
          localStorage.setItem('list', list);
        }
      });
    }
    else
      if (this.listCustomers[this.currentCustomer].client.Nombre == 'Cliente')
        this.toastr.warning("Seleccione un cliente", "Cuidado");
    if (this.listCustomers[this.currentCustomer].listAction.length == 0)
      this.toastr.warning("No hay ningun producto o paquete seleccionado", "Cuidado");
  }

  hideProductsChange() {
    this.hideProducts = !this.hideProducts;
  }

  getAllProducts(alm: string) {
    this.posService.getProducts(this.bd).subscribe(res => {
      this.productos = res.records;
      this.productos.sort(this.sortBy('Nombre'));
      this.posService.getPackages(this.bd).subscribe(res => {
        this.isLoadingResults = false;
        this.paquetes = res.records;
        this.cd.markForCheck();
        this.filtrarProductos(alm);
      });
    });
  }
}

