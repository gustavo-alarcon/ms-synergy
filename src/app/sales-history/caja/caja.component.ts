import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { Validators, FormGroup, FormBuilder, FormControl, EmailValidator } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { trigger, state, style, transition, animate, keyframes, query, stagger } from '@angular/animations';

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
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  animations : [
    trigger('fadeList', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(600),
      ]),
    ]),
  ]
})
export class CajaComponent implements OnInit {
  total: number;
  ventas: any;
  fromDate = new FormControl(moment().format('YYYY-MM-DD'));
  toDate = new FormControl(moment().format('YYYY-MM-DD'));
  //moment(this.date.value).format('YYYY-MM-DD');
  constructor(
    public DialogRef: MatDialogRef<CajaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private toastr: ToastrService
  ) {
    this.total = null;
    this.ventas = data;
  }

  ngOnInit() {
  }

  onNoClick() {
    this.DialogRef.close('close');
  }

  onSubmit() {
    this.total = null;
    if (moment(this.fromDate.value).format('YYYY-MM-DD') <= moment(this.toDate.value).format('YYYY-MM-DD')) {
      for (let i = 0; i < this.ventas.length; i++) {
        if (this.ventas[i].Fecha <= moment(this.toDate.value).format('YYYY-MM-DD') && this.ventas[i].Fecha >= moment(this.fromDate.value).format('YYYY-MM-DD')) {
          this.total = this.total + parseInt(this.ventas[i].Total);
        }
      }
      if (this.total == null || this.total == 0)
        this.toastr.show("No se encontraron resultado en ese rango de fechas.", "Lo sentimos");
    }
    else
      this.toastr.error("El valor de 'Desde' tiene que ser menor o igual al de 'Hasta'.")
  }  
  
  confirm(){
    return (!(moment(this.toDate.value).isValid()) || !(moment(this.fromDate.value).isValid()));
  }
}
