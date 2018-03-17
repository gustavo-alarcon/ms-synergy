import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {MatPaginator,  MatTableDataSource, MatSort} from '@angular/material';
import { ClientsService } from '../servicios/clients.service';
import { ToastrService } from 'ngx-toastr';
import { MessagesService } from '../servicios/messages.service'
import * as crypto from 'crypto-js';
import { PosService } from '../servicios/pos.service';


@Component({
  selector: 'sales-history',
  templateUrl: './sales-history.component.html',
  styleUrls: ['./sales-history.component.css']
})
export class SalesHistoryComponent implements OnInit {
  history : any [] = [];
  displayedColumns=['correlativo','fecha','producto','cantidad','precio','usuario','eliminar'];
  dataSource: MatTableDataSource<any>; 
  isLoadingResults = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'),'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  send : string='';
  programmed : string = '';
  balance : string = '';
  edit : boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private posService : PosService
  ) {
    this.getHistory();
   }

  ngOnInit() {
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  getHistory(){
    this.isLoadingResults = true;
    this.posService.getSalesHistory(this.bd).subscribe(data=>{
      console.log(data);
      for (let i = 0; i < data.records.length; i++) {
        if (data.records[i].Movimiento == 'SALIDA') {
          this.history.push({
            'Correlativo' : parseInt(data.records[i].Correlativo),
            'Fecha' : data.records[i].Fecha,
            'Producto' : data.records[i].Producto,
            'Cantidad' : data.records[i].Cantidad,
            'Venta' : data.records[i].Venta,
            'Usuario' : data.records[i].Usuario
          });
        } 
      }
      this.isLoadingResults = false;
      this.dataSource = new MatTableDataSource(this.history);  
      this.dataSource.paginator = this.paginator;
    });
  }
}