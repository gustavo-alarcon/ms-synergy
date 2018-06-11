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
  selector: "detail-series",
  styleUrls: ["./detail-series.component.scss"],
  template: `
   <div class="loadingSpinner" *ngIf="isLoadingResults">
      <mat-spinner *ngIf="isLoadingResults"></mat-spinner>
    </div>
   <div>
    <table style="text-align : center; width: 100%;">
        <thead style="border-bottom: 1px solid;">
            <tr>
                <th>Numero de serie</th>
                <th>Comentario</th>     
        </thead>
        <tbody>
          <tr *ngFor="let serie of numSeries; let i = index">
            <td>{{serie.numSerie}}</td>
            <td class="comment" *ngIf="serie.comentario == '' ">-</td>
            <td class="w3-center" *ngIf="serie.comentario != '' ">{{serie.comentario}}</td>
          </tr>
        </tbody>
    </table>
  </div>
  `
})
export class DetailSeriesComponent implements OnInit {
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
  numSeries = [];

  constructor(
    @Optional()
    @Host()
    public popover: SatPopover,
    private posService: PosService
  ) {}

  ngOnInit() {
    this.posService
      .getSalesNumSeries(this.bd, this.operacion, this.data)
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        console.log(data);
        this.numSeries = data.records;
      });
    // subscribe to cancellations and reset form value
    if (this.popover) {
      this.popover.closed
        .pipe(filter(val => val == null))
        .subscribe(() => (this.operacion = this.value || null));
    }
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
