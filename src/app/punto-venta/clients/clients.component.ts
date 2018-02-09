import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ClientsService } from '../../servicios/clients.service';
import {MatPaginator,  MatTableDataSource} from '@angular/material';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  displayedColumns=['name','mail','phone','place','birthday','type'];
  displayedColumns2=['name','phone','type'];
  isLoadingResults = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'),'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  clientsSales:Client[];  
  dataSource: MatTableDataSource<any>; 

  @ViewChild(MatPaginator) paginator: MatPaginator;
    
  constructor(
    public DialogRef : MatDialogRef<ClientsComponent>,
    private clientService:ClientsService,
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
