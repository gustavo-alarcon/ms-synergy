import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { MessagesService } from '../../servicios/messages.service'
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';
import * as _rollupMoment from 'moment';
import * as crypto from 'crypto-js';
import { Validators, FormGroup, FormBuilder, FormControl, EmailValidator } from '@angular/forms';
import { takeWhile } from "rxjs/operators";
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
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AddClientComponent implements OnInit {
  isLoadingResults:boolean=false;
  clientForm:FormGroup;
  minDate = new Date();
  bytes = crypto.AES.decrypt(localStorage.getItem('db'),'meraki');
  db = this.bytes.toString(crypto.enc.Utf8);
  date = new FormControl(moment().format('YYYY-MM-DD'));
  client= {
    date :'' ,
    name:'',
    type:null,
    mail:'',
    phone:null,
    place:'',
  }
  private alive: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<AddClientComponent>,
    @Inject(MAT_DIALOG_DATA) public data : string,
    private toastr: ToastrService,
    private messageService : MessagesService,
    private formBuilder: FormBuilder,
  ) { 
    
  }

  ngOnInit() {
    this.clientForm = this.formBuilder.group({
      'name': [null,Validators.compose([Validators.required,Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+$')])],
      'mail': [null,Validators.compose([Validators.required, Validators.email])],
      'phone': [null,Validators.compose([Validators.required,Validators.pattern('^[0-9]+$'),Validators.minLength(6)])],
      'place': [null,Validators.compose([Validators.required])],
      'type': [null,Validators.compose([Validators.required])],

    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  addClient(){
    this.isLoadingResults=true;
    if(this.date.invalid){
      this.toastr.error('Tiene que escoger una fecha valida','Error');
      this.isLoadingResults=false;
    }
    else{
      this.client.date = moment(this.date.value).format('YYYY-MM-DD');
      this.messageService.addClient(this.client,JSON.parse(this.db))
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        this.toastr.success('Se agrego al cliente','Exito');
        this.client= {
          date :'' ,
          name:'',
          type:'',
          mail:'',
          phone:null,
          place:'',
        }
        this.isLoadingResults=false;
        this.dialogRef.close(true);
      });
    }
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }

}
