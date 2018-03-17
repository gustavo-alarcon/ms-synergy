import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef, MatDialog } from '@angular/material';
import { PosService } from '../../servicios/pos.service';
import { ListCustomers } from "../../classes/listCustomers";
import * as crypto from 'crypto-js';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    public DialogRef: MatDialogRef<PaymentComponent>,
    private posService: PosService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.salesArray = [];
    this.customer = data;
    this.isLoadingResults = true;
    this.posService.getDocuments(this.bd).subscribe(res => {
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
    for (let i = 0; i < this.customer.listAction.length; i++) {
      this.customer.listAction[i].Correlativo = this.selectedDocument.Correlativo_actual;
      this.customer.listAction[i].Documento = this.selectedDocument.Nombre;
    }
  }

  changeSerie() {
    for (let i = 0; i < this.customer.listAction.length; i++) {
      this.customer.listAction[i].Serie = this.serieSeleccionado;
    }
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
    this.posService.regMovimiento(this.bd, this.customer.listAction).subscribe(data => {
      for (let i = 0; i < this.salesArray.length; i++) {
        this.posService.actualizarStock(this.bd, this.salesArray[i]).subscribe(data2 => {
        });
      }
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
      this.customer.listAction[i].Venta = this.customer.listAction[i].price;
      this.customer.listAction[i].Tercero = this.customer.client.Nombre;
      this.customer.listAction[i].Usuario = this.customer.client.Nombre;
    }
  }
}
