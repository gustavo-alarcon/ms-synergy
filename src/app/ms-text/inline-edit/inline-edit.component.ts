import { Component, Input, Optional, Host } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { ClientsService } from '../../servicios/clients.service';
import { filter } from 'rxjs/operators/filter';
import { FormControl } from '@angular/forms';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import * as _moment from 'moment';
import * as _rollupMoment from 'moment';
const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'l',
  },
  display: {
    dateInput: 'l',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'l',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}; 

@Component({
  selector: 'inline-edit',
  styleUrls: ['inline-edit.component.scss'],
  template: `
    <form (ngSubmit)="onSubmit()">
      <div class="mat-subheading-2">Editar</div>
      
      <mat-form-field *ngIf="type != 'tipo' && type != 'cumple'">
        <input matInput maxLength="140" name="comment" [(ngModel)]="comment">
        <mat-hint align="end">{{comment?.length || 0}}/140</mat-hint>
      </mat-form-field>

      <mat-form-field *ngIf="type == 'tipo'" name="type" ngDefaultControl>
        <mat-select placeholder="Tipo de cliente" [(value)]="comment">
          <mat-option value=1>Franquicia</mat-option>
          <mat-option value=2>Promociones</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="type == 'cumple'">
        <input matInput [matDatepicker]="picker" [formControl]="date" placeholder="Ponga la fecha de nacimiento">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker touchUi="true" #picker ngDefaultControl></mat-datepicker>
      </mat-form-field>

      <div class="actions">
        <button mat-button type="button" color="primary" (click)="onCancel()">Cancelar</button>
        <button mat-button type="submit" color="primary">Guardar</button>
      </div>
    </form>
  `
})
export class InlineEditComponent {
  disabled = true;
  date : FormControl;
  aux;
  /** Overrides the comment and provides a reset value when changes are cancelled. */
  @Input()
  get value(): string { return this._value; }
  set value(x: string) {
    this.comment = this._value = x;
    this.date = new FormControl(moment(this.comment).format());
    this.aux = this.date;
  }
  private _value = '';
  
  @Input('type') type;

  @Input('client') client;

  /** Form model for the input. */
  comment = '';

  constructor(
    @Optional() @Host() public popover: SatPopover,
    private clientServicie : ClientsService,
    private toastr : ToastrService)
   {}

  ngOnInit() {
    // subscribe to cancellations and reset form value
    if (this.popover) {
      this.popover.closed.pipe(filter(val => val == null))
        .subscribe(() => this.comment = this.value || '');
    }
  }


  onSubmit() {
    if (this.popover) {
      if(this.type == 'nombre')
        this.client.Name = this.comment;
      if(this.type == 'correo')
        this.client.Mail = this.comment;
      if(this.type == 'telefono')
        this.client.Phone = this.comment;
      if(this.type == 'lugar')
        this.client.Place = this.comment;
      if(this.type == 'cumple')
        this.client.Birthday = moment(this.date.value).format('YYYY-MM-DD');
      if(this.type == 'tipo')
        this.client.Type = this.comment;
      if(this.date.invalid && this.type == 'cumple'){
          this.toastr.error('Tiene que escoger una fecha valida','Error');
          this.date = this.aux;
      }
      else{
        this.popover.close(this.comment);
        //this.clientServicie.updateClient(this.client);
      }
    }
  }

  onCancel() {
    if (this.popover) {
      this.popover.close();
    }
  }
}