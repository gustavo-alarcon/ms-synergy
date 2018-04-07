import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef, MatDialog } from '@angular/material';
import { PosService } from '../../servicios/pos.service';
import { ListCustomers } from "../../classes/listCustomers";
import * as crypto from 'crypto-js';
import { ToastrService } from 'ngx-toastr';
import "rxjs/add/operator/takeWhile";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {

  customer: ListCustomers;
  entregado: string = '';
  vuelto: string = '';
  paymentType: any = '';
  documentos: any[] = [];
  numerosSerie: any[][];
  selectedDocument: any = '';
  serieSeleccionado: any = '';
  correlativo: any = '';
  inputCorrelativo: boolean = true;
  salesArray: any[];
  bytes = crypto.AES.decrypt(localStorage.getItem('db'), 'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  isLoadingResults = false;
  private alive: boolean = true;

  constructor(
    public DialogRef: MatDialogRef<PaymentComponent>,
    private posService: PosService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.salesArray = [];
    this.customer = data;
    console.log(this.customer);
    this.isLoadingResults = true;
    this.posService.getDocuments(this.bd)
      .takeWhile(() => this.alive)
      .subscribe(res => {
        let _serie = '';
        this.numerosSerie = [];
        res.records.forEach(element => {
          if (element.Naturaleza == 'SALIDA') {
            this.documentos.push(element);
            if (element['Numtienda'] != _serie && this.numerosSerie.indexOf(element['Numtienda']) < 0) {
              this.numerosSerie.push(element['Numtienda']);
              _serie = element['Numtienda'];
            }
          }
        });
        this.isLoadingResults = false;
      });
    this.getArraySale();
    this.fixArray();
  }

  ngOnInit() {

  }

  changeDocument() {
    this.correlativo = this.selectedDocument.Correlativo_actual;
    this.customer.correlativo = this.selectedDocument.Correlativo_actual;
    this.customer.documento = this.selectedDocument.Nombre;
  }

  changeSerie() {
    this.customer.serie = this.serieSeleccionado;
  }

  changePaymentType() {
    this.customer.paymentType = this.paymentType;
  }

  onNoClick() {
    this.DialogRef.close(false);
  }

  addPayment(int) {
    if (int == '.') {
      for (let x = 0; x < this.entregado.length; x++)
        if (this.entregado[x] == '.') { return; }
    }
    this.entregado = this.entregado + int;
    if (int != '.') {
      this.darVuelto();
    }
  }

  backspace() {
    if (this.entregado == '') {
      this.vuelto = '';
      return;
    }
    else {
      this.entregado = this.entregado.slice(0, -1);
      if (this.entregado[this.entregado.length - 1] != '.') {
        this.darVuelto();
      }
    }
  }

  darVuelto() {
    let total: string;
    total = this.customer.total.toString();
    if (parseFloat(this.entregado) > parseFloat(total)) {
      this.vuelto = (parseFloat(this.entregado) - parseFloat(total)).toString();
      this.vuelto = parseFloat(this.vuelto).toFixed(2);
    }
    else {
      this.vuelto = '';
    }
  }

  confirm() {
    return (this.entregado == '' || parseInt(this.entregado) < this.customer.total || this.paymentType == '' || this.selectedDocument == '' || this.serieSeleccionado == '' || this.entregado[this.entregado.length - 1] == '.');
  }

  confirmSale() {
    this.isLoadingResults = true;
    this.customer.date = this.currentDate();
    this.customer.given = this.entregado;
    this.customer.change = this.vuelto;
    this.posService.regMovimiento(this.bd, this.customer)
      .takeWhile(() => this.alive)
      .subscribe(data => {
        for (let i = 0; i < this.salesArray.length; i++) {
          this.posService.actualizarStock(this.bd, this.salesArray[i])
            .takeWhile(() => this.alive)
            .subscribe(data2 => {
            });
        }
        this.posService.updateCorrelativo(this.bd, this.selectedDocument)
          .takeWhile(() => this.alive)
          .subscribe(data => {
          });
        this.isLoadingResults = false;
        this.toastr.success("Se realizo la venta con exito", "Exito");
        this.DialogRef.close(true);
      });
  }

  getArraySale() {
    for (let i = 0; i < this.customer.listAction.length; i++) {
      if (this.customer.listAction[i].package == 0) {
        this.salesArray.push({
          'ID': this.customer.listAction[i].idReal,
          "Cantidad": parseInt(this.customer.listAction[i].units) * -1
        });
      }
      else {
        for (let j = 0; j < this.customer.listAction[i].products.length; j++) {
          this.salesArray.push({
            'ID': parseInt(this.customer.listAction[i].products[j].idReal),
            "Cantidad": parseInt(this.customer.listAction[i].products[j].cantidad) * -1
          });
        }
      }
    }
  }

  fixArray() {
    for (let i = 0; i < this.customer.listAction.length; i++) {
      this.customer.listAction[i].Cantidad = this.customer.listAction[i].units;
    }
  }

  currentDate() {
    const currentDate = new Date();

    if (31 < 31) {
      if (31 + 1 < 10) {
        if (currentDate.getMonth() + 1 < 10) {
          var limite = currentDate.getFullYear() + '-0' + (currentDate.getMonth() + 1) + '-0' + ((31 + 1) % 31);
        } else {
          var limite = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-0' + ((31 + 1) % 31);
        }
      } else {
        if (currentDate.getMonth() + 1 < 10) {
          var limite = currentDate.getFullYear() + '-0' + (currentDate.getMonth() + 1) + '-' + ((31 + 1) % 31);
        } else {
          var limite = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + ((31 + 1) % 31);
        }
      }
    } else {
      if (currentDate.getMonth() + 1 < 12) {
        if ((currentDate.getMonth() + 2) % 13 + 1 < 10) {
          var limite = currentDate.getFullYear() + '-0' + (((currentDate.getMonth() + 2) % 13) + 1) + '-0' + (1);
        } else {
          var limite = currentDate.getFullYear() + '-' + (((currentDate.getMonth() + 2) % 13) + 1) + '-0' + (1);
        }
      } else {
        if ((currentDate.getMonth() + 2) % 13 + 1 < 10) {
          var limite = (currentDate.getFullYear() + 1) + '-0' + (((currentDate.getMonth() + 2) % 13) + 1) + '-0' + (1);
        } else {
          var limite = (currentDate.getFullYear() + 1) + '-' + (((currentDate.getMonth() + 2) % 13) + 1) + '-0' + (1);
        }
      }

    }

    return currentDate;
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
