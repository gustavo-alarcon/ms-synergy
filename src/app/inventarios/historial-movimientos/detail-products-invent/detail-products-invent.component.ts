import {
  Component,
  OnInit,
  Input,
  Optional,
  Host,
  OnDestroy
} from "@angular/core";
import { SatPopover } from "@ncstate/sat-popover";
import { filter } from "rxjs/operators";
import { PosService } from "../../../servicios/pos.service";
import * as crypto from "crypto-js";
import { takeWhile } from "rxjs/operators";

@Component({
  selector: "detail-products-invent",
  styleUrls: ["./detail-products-invent.component.scss"],
  template: `
   <div class="loadingSpinner" *ngIf="isLoadingResults">
      <mat-spinner *ngIf="isLoadingResults"></mat-spinner>
    </div>
   <div *ngIf="data.Documento != 'Union de stock'">
     <h2 class="header">
      <span class="marginRight">{{data.Fecha}}</span>
      <span>Documento: {{data.Documento}}</span>
      <span class="marginLeft">Número: {{data.Serie}}-{{data.Correlativo}}</span>
     </h2>
     <div>
      <div class="descripPadding">Almacen de origen:<span class="marginText">{{data.AlmacenOrigen}}</span></div>
      <div class="descripPadding" *ngIf="data.Movimiento == 'TRANSFERENCIA'">Almacen de destino:<span class="marginText">{{data.AlmacenDestino}}</span></div>
      <div class="descripPadding">Recepciona:<span class="marginText">{{data.Usuario}}</span></div>
      <div class="descripPadding">Operacion:<span class="marginText">{{data.Operacion}}</span></div>
      <div class="descripPadding">Tipo de movimiento:<span class="marginText">{{data.Movimiento}}</span></div>

     </div>
     <div class="paddingTable">
       <table style="text-align : center; width: 100%;">
          <thead style="border-bottom: 1px solid;">
              <tr>
                  <th>Paquete</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th *ngIf="data.Movimiento == 'ENTRADA'">Compra</th>
                  <th *ngIf="data.Movimiento == 'SALIDA'">Precio U.</th>
                  <th *ngIf="data.Movimiento == 'SALIDA'">Precio</th>
                  <th *ngIf="data.Movimiento == 'SALIDA'">Num. Series</th>
              </tr>
          </thead>
          <tbody>
              <tr *ngFor="let product of products; let i = index">
                  <td>{{product.Paquete == '' ? '-' : product.Paquete}}</td>
                  <td>{{product.Producto}}</td>
                  <td>{{product.Cantidad}}</td>
                  <td *ngIf="data.Movimiento == 'ENTRADA'">{{product.Compra}}</td>
                  <td *ngIf="data.Movimiento == 'SALIDA'">{{product.Venta}}</td>
                  <td *ngIf="data.Movimiento == 'SALIDA'">{{product.Venta * product.Cantidad}}</td>
                  <td *ngIf="data.Movimiento == 'SALIDA'">
                    <div [satPopoverAnchorFor]="p">
                      <button matTooltip="Detalles" matTooltipPosition="above" mat-icon-button style="margin : 0px" (click)="p.open()">
                        <mat-icon style="margin-right: 0px;">keyboard_arrow_down</mat-icon>
                      </button>
                      <sat-popover #p hasBackdrop>
                        <detail-series [value]="operacion" [data]="product.Producto"></detail-series>
                      </sat-popover>
                    </div>
                  </td>
              </tr>
          </tbody>
      </table>
     </div>
     <div *ngIf="data.POS == 'true'">
       <hr/>
        <span class='listSubTotal'>Sub-total: <span class="lightFont">$ {{data.SubTotal}}</span></span>
        <span class='listIGV'>IGV: <span class="lightFont">$ {{data.IGV}}</span></span>
        <span class='listTotal'>Total: <span class="lightFont">$ {{data.Total}}</span></span>
        <hr/>
        <span class='listSubTotal'>Tipo: {{type}}</span>
        <span class='listIGV'>Recibido: $ {{data.Entregado}}</span>
        <span class='listTotal'>Cambio: $ {{data.Vuelto}}</span>
     </div>
     <div *ngIf="data.POS == 'false' && data.Movimiento == 'SALIDA'">
        <hr/>
        <span class='listTotal'>Total: <span class="lightFont">$ {{total}}</span></span>
     </div>
    </div>
    <div *ngIf="data.Documento == 'Union de stock'">
      <h2 class="header">
        <span class="marginRight">{{data.Fecha}}</span>
        <span class="marginLeft">Documento: {{data.Documento}}</span>
      </h2>
      <div>
        <div class="descripPadding">Almacen de origen:<span class="marginText">{{data.AlmacenOrigen}}</span></div>
        <div class="descripPadding" *ngIf="data.Movimiento == 'TRANSFERENCIA'">Almacen de destino:<span class="marginText">{{data.AlmacenDestino}}</span></div>
        <div class="descripPadding">Recepciona:<span class="marginText">{{data.Usuario}}</span></div>
        <div class="descripPadding" *ngFor="let product of products">Producto:<span class="marginText">{{product.Producto}}</span></div>
        <div class="descripPadding">Operacion:<span class="marginText">{{data.Movimiento}}</span></div>
        <div class="descripPadding">Descripcion:<span class="marginText">Union de ambos stocks</span></div>
      </div>
     </div>
  `
})
export class DetailProductsInventComponent implements OnInit {
  isLoadingResults = false;
  bytes = crypto.AES.decrypt(localStorage.getItem("db"), "meraki");
  bd = this.bytes.toString(crypto.enc.Utf8);
  private alive: boolean = true;

  /** Overrides the comment and provides a reset value when changes are cancelled. */
  @Input()
  get value(): any {
    return this._value;
  }
  set value(x: any) {
    this.operacion = this._value = x;
    parseInt(this.operacion);
  }

  @Input("data") data;

  private _value = null;

  /** Form model for the input. */
  operacion = null;
  products = [];
  type = "";
  total = 0;

  constructor(
    @Optional()
    @Host()
    public popover: SatPopover,
    private posService: PosService
  ) {}

  ngOnInit() {
    this.paymentType();
    this.posService
      .getSalesData(this.bd, this.operacion)
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        this.products = data.records;
        if (this.data.Movimiento == "SALIDA" && this.data.POS == "false") {
          for (let i = 0; i < this.products.length; i++) {
            this.total =
              this.total + this.products[i].Venta * this.products[i].Cantidad;
          }
        }
      });
    // subscribe to cancellations and reset form value
    if (this.popover) {
      this.popover.closed
        .pipe(filter(val => val == null))
        .subscribe(() => (this.operacion = this.value || null));
    }
  }

  paymentType() {
    if (this.data.TipoPago == "0") this.type = "Efectivo";
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
