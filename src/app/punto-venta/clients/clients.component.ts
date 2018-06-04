import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { MatDialogRef, MatDialog } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import { ClientsService } from "../../servicios/clients.service";
import { MatPaginator, MatTableDataSource } from "@angular/material";
import * as crypto from "crypto-js";
import { AddClient2Component } from "./add-client/add-client.component";
import { Client } from "../../classes/client";
import { takeWhile } from "rxjs/operators";

@Component({
  selector: "app-clients",
  templateUrl: "./clients.component.html",
  styleUrls: ["./clients.component.css"]
})
export class ClientsComponent implements OnInit {
  displayedColumns = ["Nombre", "IdentiClass", "Identi", "Direccion"];
  displayedColumns2 = ["Nombre", "IdentiClass", "Identi"];
  isLoadingResults = false;
  bytes = crypto.AES.decrypt(localStorage.getItem("db"), "meraki");
  bd = this.bytes.toString(crypto.enc.Utf8);
  clientsSales: Client[];
  dataSource: MatTableDataSource<any>;
  private alive: boolean = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public DialogRef: MatDialogRef<ClientsComponent>,
    private clientService: ClientsService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getClients();
  }

  onNoClick() {
    this.DialogRef.close("close");
  }

  selectCustomer(client) {
    this.DialogRef.close(client);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  getClients() {
    this.isLoadingResults = true;
    this.clientService
      .getTerceros(this.bd)
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        this.clientsSales = data.records;
        for (let i = 0; i < data.length; i++) {
          this.clientsSales.push({
            ID: data.ID,
            Name: data.Name,
            Mail: data.Mail,
            Phone: data.Phone,
            Place: data.Place,
            select: false,
            Birthday: data.Birthday,
            Type: data.Type
          });
        }
        this.isLoadingResults = false;
        this.dataSource = new MatTableDataSource(this.clientsSales);
        this.dataSource.paginator = this.paginator;
      });
  }

  addClient() {
    let dialogRef = this.dialog.open(AddClient2Component, {
      width: "auto",
      data: "text",
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getClients();
      }
    });
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
