import { Component, OnInit, ViewChild, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ClientsService } from '../../servicios/clients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InputModalComponent } from '../input-modal/input-modal.component';
import { ToastrService } from 'ngx-toastr';
import { AddClientComponent } from '../add-client/add-client.component';
import { MessagesService } from '../../servicios/messages.service'
import * as crypto from 'crypto-js';
import { trigger, state, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { Client } from '../../classes/client';
import { takeWhile } from "rxjs/operators";
import { Confirm2Component } from '../confirm/confirm2.component';


@Component({
  selector: 'messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit {
  // dataSource:dataSource;
  all: boolean = false;
  fran: boolean = false;
  prom: boolean = false;
  clientsSales: Client[] = [];
  displayedColumns = ['name', 'mail', 'phone', 'place', 'birthday', 'type', 'seleccionar', 'eliminar'];
  displayedColumns2 = ['name', 'phone', 'type', 'seleccionar', 'eliminar'];
  dataSource: MatTableDataSource<Client>;
  isLoadingResults = false;
  isLoadingBubbles = false;
  bytes = crypto.AES.decrypt(localStorage.getItem('db'), 'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);
  send: string = '';
  programmed: string = '';
  balance: string = '';
  edit: boolean = false;
  message1: string = "Haga click para personalizar un mensaje";
  private alive: boolean = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private clientService: ClientsService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private messageService: MessagesService,
    private cd : ChangeDetectorRef
  ) {
    this.getClients();
    this.getBubbleValues();
  }

  ngOnInit() {
  }


  ngAfterViewInit() {

  }

  getClients() {
    this.clientsSales = [];
    this.isLoadingResults = true;
    this.clientService.getBdClient(this.bd)
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        for (let i = 0; i < data.records.length; i++) {
          this.clientsSales.push({
            ID: parseInt(data.records[i].ID),
            Name: data.records[i].Name.toString(),
            Mail: data.records[i].Mail.toString(),
            Phone: parseInt(data.records[i].Phone),
            Place: data.records[i].Place.toString(),
            select: false,
            Birthday: data.records[i].Birthday,
            Type: parseInt(data.records[i].Type),
          });
          this.cd.markForCheck();
        }
        this.isLoadingResults = false;
        this.dataSource = new MatTableDataSource(this.clientsSales);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  slideToogleChange(e) {
    if (e.checked) {
      this.edit = true;
      this.message1 = "Haga click en una celda para actualizarla";
    }
    else {
      this.edit = false;
      this.message1 = "Haga click para personalizar un mensaje";
    }
  }

  getBubbleValues() {
    this.isLoadingBubbles = true;
    this.messageService.getBubbleValues()
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        this.balance = data.records[0].Saldo;
        this.programmed = data.records[0].Programados;
        this.send = data.records[0].Enviados;
        this.isLoadingBubbles = false;
        this.cd.markForCheck();
      });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  openDialog(client): void {
    let min = false;
    for (let i = 0; i < this.clientsSales.length; i++) {
      if (this.clientsSales[i].select == true) {
        min = true;
        break;
      }
    }
    if (min == true) {
      let datos = [];
      if (this.all == true) {
        for (let i = 0; i < this.clientsSales.length; i++) {
          datos.push({
            "name": this.clientsSales[i].Name,
            "phone": this.clientsSales[i].Phone,
            "type": this.clientsSales[i].Type
          });
        }
      }
      else {
        for (let i = 0; i < this.clientsSales.length; i++) {
          if (this.clientsSales[i].select == true) {
            datos.push({
              "name": this.clientsSales[i].Name,
              "phone": this.clientsSales[i].Phone,
              "type": this.clientsSales[i].Type
            });
          }
        }
      }
      let dialogRef = this.dialog.open(InputModalComponent, {
        width: 'auto',
        data: datos,
        autoFocus: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.toastr.success("Se programaron los mensajes para la fecha y hora indicada", "Exito");
        }
      });
    }
    else {
      if (client != 0) {
        let datos = [];
        datos.push({
          "name": client.Name,
          "phone": client.Phone,
          "type": client.Type
        });
        let dialogRef = this.dialog.open(InputModalComponent, {
          width: '500px',
          data: datos
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.toastr.success("Se programaron los mensajes para la fecha y hora indicada", "Exito");
            this.getBubbleValues();
          }
        });
      }
      else {
        this.toastr.warning('Por lo menos seleccione un cliente para empezar a programar los mensajes', 'Seleccione uno');
      }
    }
  }

  changeAll(e) {
    if (e.checked == true) {
      for (let i = 0; i < this.clientsSales.length; i++) {
        this.clientsSales[i].select = true;
      }
      this.prom = true;
      this.fran = true;
    }
    else {
      for (let i = 0; i < this.clientsSales.length; i++) {
        this.clientsSales[i].select = false;
      }
      this.prom = false;
      this.fran = false;
    }
  }

  confirmAll(e, type) {
    if (this.all == true && e.checked == false)
      this.all = false;
    if (this.fran == true && e.checked == false && type == '1')
      this.fran = false;
    if (this.prom == true && e.checked == false && type == '2')
      this.prom = false;
  }

  changeFranchise(e) {
    for (let i = 0; i < this.clientsSales.length; i++) {
      if (this.clientsSales[i].Type == 1) {
        if (e.checked == true)
          this.clientsSales[i].select = true;
        else
          this.clientsSales[i].select = false;
      }
    }
    if (e.checked == true) {
      this.fran = true;
      if (this.prom == true)
        this.all = true;
    }
    else {
      this.fran = false;
      if (this.all == true)
        this.all = false;
    }
  }

  changeProm(e) {
    for (let i = 0; i < this.clientsSales.length; i++) {
      if (this.clientsSales[i].Type == 2) {
        if (e.checked == true)
          this.clientsSales[i].select = true;
        else
          this.clientsSales[i].select = false;
      }
    }
    if (e.checked == true) {
      this.prom = true;
      if (this.fran == true)
        this.all = true;
    }
    else {
      this.prom = false;
      if (this.all == true)
        this.all = false;
    }
  }

  openClient() {
    let dialogRef = this.dialog.open(AddClientComponent, {
      width: 'auto',
      data: null,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
        this.getClients();
    });
  }

  deleteCustomer(cliente) {
    let dialogRef = this.dialog.open(Confirm2Component, {
      width: 'auto',
      data: cliente.Name,
    });

    dialogRef.beforeClose().subscribe(result => {
      if (result != 'close' && result != undefined) {
        this.clientService.deleteClient(this.bd, cliente)
          .pipe(takeWhile(() => this.alive))
          .subscribe(data => {
            if (data == "true") {
              this.toastr.success("Se elimino al cliente con exito", "Exito");
              this.getClients();
            }
            else
              this.toastr.error("Hubo un error", "Error");
          },
        err => {
          this.toastr.error("Hubo un error", "Error");
        })
      }
    });
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }

}