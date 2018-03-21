import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ClientsService } from '../servicios/clients.service';
import { ToastrService } from 'ngx-toastr';
import { MessagesService } from '../servicios/messages.service'
import * as crypto from 'crypto-js';
import { PosService } from '../servicios/pos.service';
import { HistorySales } from '../classes/history-sales'

@Component({
  selector: 'sales-history',
  templateUrl: './sales-history.component.html',
  styleUrls: ['./sales-history.component.css']
})
export class SalesHistoryComponent implements OnInit {
  history: any[] = [];
  displayedColumns = ['correlativo', 'fecha', 'usuario', 'productos', 'eliminar'];
  dataSource: MatTableDataSource<any>;
  isLoadingResults = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'), 'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  send: string = '';
  programmed: string = '';
  balance: string = '';
  edit: boolean = false;
  historyTable: HistorySales[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private posService: PosService,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService
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

  getHistory() {
    this.isLoadingResults = true;
    this.posService.getSalesHistory(this.bd).subscribe(data => {
      for (let i = 0; i < data.records.length; i++) {
        if (data.records[i].Movimiento == 'SALIDA') {
          this.history.push({
            'Correlativo': parseInt(data.records[i].Correlativo),
            'Operacion': data.records[i].Operacion,
            'Fecha': data.records[i].Fecha,
            'Producto': data.records[i].Producto,
            'Cantidad': data.records[i].Cantidad,
            'Venta': data.records[i].Venta,
            'Usuario': data.records[i].Usuario,
            'Estado': data.records[i].Estado
          });
        }
      }
      this.orderArray();
    },
      err => {
        this.isLoadingResults = false;
        this.toastr.error("Ocurrio un error", "Error");
        this.cd.markForCheck();
      })
  }

  orderArray() {
    let last = '';
    let positionLast = 0;
    this.history.sort(this.dynamicSort('Correlativo'));
    for (let i = 0; i < this.history.length; i++) {
      if (this.history[i].Correlativo != last) {
        this.historyTable.push({
          correlativo: this.history[i].Correlativo,
          fecha: this.history[i].Fecha,
          usuario: this.history[i].Usuario,
          estado : this.history[i].Estado,
          products: []
        });
        last = this.history[i].Correlativo;
        positionLast = this.historyTable.length-1;
        this.historyTable[this.historyTable.length-1].products.push({
          producto: this.history[i].Producto,
          cantidad: this.history[i].Cantidad,
          operacion: this.history[i].Operacion,
          venta: this.history[i].Venta
        });
      }
      else {
        this.historyTable[positionLast].products.push({
          producto: this.history[i].Producto,
          cantidad: this.history[i].Cantidad,
          operacion: parseInt(this.history[i].Operacion),
          venta: this.history[i].Venta
        });
      }
    }
    for (let i = 0; i < this.historyTable.length; i++) {
      this.historyTable[i].products.sort(this.dynamicSort("operacion")); 
    }
      this.isLoadingResults = false;
      this.dataSource = new MatTableDataSource(this.historyTable);
      this.dataSource.paginator = this.paginator;
    }

  dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }
}