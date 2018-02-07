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
  selector: 'messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit{
  // dataSource:dataSource;
  all:boolean=false;
  fran:boolean=false;
  prom:boolean=false;
  clientsSales:Client[];  
  displayedColumns=['name','mail','phone','place','birthday','type','seleccionar'];
  displayedColumns2=['name','phone','type','seleccionar'];
  dataSource: MatTableDataSource<any>; 
  isLoadingResults = false;
  isLoadingBubbles = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'),'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  send : string='';
  programmed : string = '';
  balance : string = '';
 

  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(
    private clientService:ClientsService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private messageService : MessagesService,
  ) {  
      this.getClients();
      this.getBubbleValues();
  }

  ngOnInit() {
  }


  ngAfterViewInit() {
    
  }

  getClients(){
    this.isLoadingResults = true;
    this.clientService.getBdClient(this.bd).subscribe(data=>{
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

  getBubbleValues(){
    this.isLoadingBubbles = true;
    this.messageService.getBubbleValues().subscribe(data=>{
      this.balance = data.records[0].Saldo;
      this.programmed = data.records[0].Programados;
      this.send = data.records[0].Enviados;
      this.isLoadingBubbles = false;
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  openDialog(client): void {
    let min=false;
    for(let i=0;i<this.clientsSales.length;i++){
      if(this.clientsSales[i].select==true){
        min=true;
        break;
      }
    }
    if(min==true){
      let datos=[];
      if(this.all==true){
        for(let i=0;i<this.clientsSales.length;i++){
          datos.push({
            "name":this.clientsSales[i].Name,
            "phone":this.clientsSales[i].Phone,
            "type" : this.clientsSales[i].Type
          });
        }
      }
      else{
        for(let i=0;i<this.clientsSales.length;i++){
          if(this.clientsSales[i].select==true){
            datos.push({
              "name":this.clientsSales[i].Name,
              "phone": this.clientsSales[i].Phone,
              "type" : this.clientsSales[i].Type
            });
          }
        }
      }
      let dialogRef = this.dialog.open(InputModalComponent, {
        width: '500px',
        data: datos
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.toastr.success("Se programaron los mensajes para la fecha indicada","Exito");
        }
      });
    }
    else{
      if(client!=0){
        let datos=[];
        datos.push({
          "name": client.Name,
          "phone":  client.Phone,
          "type" : client.Type
        });
        let dialogRef = this.dialog.open(InputModalComponent, {
          width: '500px',
          data: datos
        });
        
        dialogRef.afterClosed().subscribe(result => {
          if(result){
            this.toastr.success("Se programaron los mensajes para la fecha indicada","Exito");
            this.getBubbleValues();
          }
        });
      }
      else{
      this.toastr.warning('Por lo menos seleccione un cliente para empezar a programar los mensajes','Seleccione uno');
      }
    }
  }

  changeAll(e){
    if(e.checked==true){
      for(let i=0;i<this.clientsSales.length;i++){
          this.clientsSales[i].select=true;
      }
    }
    else{
      for(let i=0;i<this.clientsSales.length;i++){
          this.clientsSales[i].select=false;
      }
    }
  }

  confirmAll(e,type){
    if(this.all==true && e.checked==false)
      this.all=false;
    if(this.fran==true && e.checked==false && type=='1')
      this.fran=false;
    if(this.prom==true && e.checked==false && type=='2')
      this.prom=false;
  }

  changeFranchise(e){
    for(let i=0;i<this.clientsSales.length;i++){
      if(this.clientsSales[i].Type=='1'){
        if(e.checked==true)
          this.clientsSales[i].select=true;
        else
          this.clientsSales[i].select=false;
      }
    }
    if(e.checked==true){
      this.fran=true;
    }
    else{
      this.fran=false;
    }
  }

  changeProm(e){
    for(let i=0;i<this.clientsSales.length;i++){
      if(this.clientsSales[i].Type=='2'){
        if(e.checked==true)
          this.clientsSales[i].select=true;
        else
          this.clientsSales[i].select=false;
      }
    }
    if(e.checked==true){
      this.prom=true;
    }
    else{
      this.prom=false;
    }
  }

  openClient(){
    let dialogRef = this.dialog.open(AddClientComponent, {
      width: '500px',
      data: null
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if(result)
        this.getClients();
    });
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