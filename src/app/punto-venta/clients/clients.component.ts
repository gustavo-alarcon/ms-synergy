import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ClientsService } from '../../servicios/clients.service';
import {MatPaginator,  MatTableDataSource} from '@angular/material';
import * as crypto from 'crypto-js';
import { AddClient2Component } from './add-client/add-client.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  displayedColumns=['Identi','IdentiClass','Nombre','Direccion'];
  displayedColumns2=['Identi','IdentiClass','Nombre'];
  isLoadingResults = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'),'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  clientsSales:Client[];  
  dataSource: MatTableDataSource<any>; 

  @ViewChild(MatPaginator) paginator: MatPaginator;
    
  constructor(
    public DialogRef : MatDialogRef<ClientsComponent>,
    private clientService:ClientsService,
    private dialog : MatDialog,

  ) {
      
    this.getClients();  

   }

  ngOnInit() {
  }

  onNoClick(){
    this.DialogRef.close('close');
  }

  selectCustomer(client){
    this.DialogRef.close(client);
  }

  withoutClient(){
    this.DialogRef.close('sin');
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  getClients(){
    console.log(this.bd);
    this.isLoadingResults = true;
    this.clientService.getTerceros(this.bd).subscribe(data=>{
      console.log(data);
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

  addClient(){
    let dialogRef = this.dialog.open(AddClient2Component,{
      width : '80%',
      data : 'text' 
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        console.log("Entro");
        this.getClients();
      }
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
