import { Component, OnInit, Input, Optional, Host, OnDestroy } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { filter } from 'rxjs/operators/filter';
import { PosService } from '../../servicios/pos.service';
import * as crypto from 'crypto-js';
import "rxjs/add/operator/takeWhile";

@Component({
  selector: 'detail-products',
  styleUrls: ['./detail-products.component.scss'],
  template:
    `
   <div class="loadingSpinner" *ngIf="isLoadingResults">
      <mat-spinner *ngIf="isLoadingResults"></mat-spinner>
    </div>
   <table style="text-align : center; width: 100%;">
      <thead style="border-bottom: 1px solid;">
          <tr>
              <th>Paquete</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio U.</th>
              <th>Precio</th>
          </tr>
      </thead>
      <tbody>
          <tr *ngFor="let product of products">
              <td>{{product.Paquete == '' ? '-' : product.Paquete}}</td>
              <td>{{product.Producto}}</td>
              <td>{{product.Cantidad}}</td>
              <td>{{product.Venta}}</td>
              <td>{{product.Venta * product.Cantidad}}</td>
          </tr>
      </tbody>
  </table>
  <hr/>
  <span class='listSubTotal'>Sub-total: $ {{data.SubTotal}}</span>
  <span class='listIGV'>IGV: $ {{data.IGV}}</span>
  <span class='listTotal'>Total: $ {{data.Total}}</span>
  <hr/>
  <span class='listSubTotal'>Tipo: {{type}}</span>
  <span class='listIGV'>Recibido: $ {{data.Entregado}}</span>
  <span class='listTotal'>Cambio: $ {{data.Vuelto}}</span>
  `
})
export class DetailProductsComponent implements OnInit {
  isLoadingResults = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'), 'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  private alive: boolean = true;

  /** Overrides the comment and provides a reset value when changes are cancelled. */
  @Input()
  get value(): any { return this._value; }
  set value(x: any) {
    this.operacion = this._value = x;
    parseInt(this.operacion);
  }

  @Input('data') data;

  private _value = null;

  /** Form model for the input. */
  operacion = null
  products = [];
  type = '';

  constructor(
    @Optional() @Host() public popover: SatPopover,
    private posService: PosService
  ) {

  }

  ngOnInit() {
    this.paymentType();
    this.posService.getSalesData(this.bd, this.operacion)
      .takeWhile(() => this.alive)
      .subscribe(data => {
        this.products = data.records;
        console.log(this.products);
      });
    // subscribe to cancellations and reset form value
    if (this.popover) {
      this.popover.closed.pipe(filter(val => val == null))
        .subscribe(() => this.operacion = this.value || null);
    }
  }

  paymentType(){
    if(this.data.TipoPago == '0')
      this.type = 'Efectivo';
  }

  onSubmit() {
    if (this.popover) {
      this.popover.close();
    }
  }

  onCancel() {
    if (this.popover) {
      this.popover.close();
    }
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}