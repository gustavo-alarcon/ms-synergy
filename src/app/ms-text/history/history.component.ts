import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {MatPaginator,  MatTableDataSource} from '@angular/material';
import { ClientsService } from '../../servicios/clients.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { InputModalComponent } from '../input-modal/input-modal.component';
import { ToastrService } from 'ngx-toastr';
import { AddClientComponent } from '../add-client/add-client.component';
import { MessagesService } from '../../servicios/messages.service'
import * as crypto from 'crypto-js';

@Component({
  selector: 'history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  all:boolean=false;
  fran:boolean=false;
  prom:boolean=false;
  clientsSales:Client[];  
  displayedColumns=['name','mail','phone','place','birthday','type','seleccionar','eliminar'];
  displayedColumns2=['name','phone','type','seleccionar','eliminar'];
  dataSource: MatTableDataSource<any>; 
  isLoadingResults = false;
  isLoadingBubbles = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'),'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  send : string='';
  programmed : string = '';
  balance : string = '';
  edit : boolean = false;
  message1 : string = "Haga click para personalizar un mensaje";

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private messageService : MessagesService
  ) {
    this.getMessages();
   }

  ngOnInit() {
  }

  getMessages(){
    this.isLoadingResults = true;
    this.messageService.getMessages(this.bd).subscribe(data=>{
      this.clientsSales = data.records;
      for(let i=0;i<data.length;i++){
        this.clientsSales.push({
          Name : data.Name,
          Mail : data.Mail,
          Phone : data.Phone,
          Place : data.Place,
          select: false,
          Birthday : data.Birthday,
          Type: data.Type,
        });
      }
      this.isLoadingResults = false;
      this.dataSource = new MatTableDataSource(this.clientsSales);  
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  
  slideToogleChange(e){
    if(e.checked){
      this.edit = true;
      this.message1 = "Haga click en una celda para actualizarla";
    }
    else{
      this.edit = false;
      this.message1 = "Haga click para personalizar un mensaje";
    }
  }

}

export interface Client{
  Name:string;
  Mail:string;
  Phone:string;
  Place:string;
  Birthday:string;
  Type:string;
  select:boolean;
}