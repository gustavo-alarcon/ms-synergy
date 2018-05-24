import { LoginService } from "./../../servicios/login/login.service";
import { InventariosService } from "./../../servicios/almacenes/inventarios.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { takeWhile } from "rxjs/operators";
import * as crypto from "crypto-js";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ImagenComponent } from "./imagen/imagen.component";
@Component({
  selector: "app-productos",
  templateUrl: "./productos.component.html",
  styleUrls: ["./productos.component.css"]
})
export class ProductosComponent implements OnInit {
  selectedIndex: any;
  filteredOptions: any = [];
  productoFilter: any = new FormControl();
  prodEscogido: any = "";
  data_: any[] = [];
  productosFiltrados: any[] = [];
  paquetes: any[] = [];
  pack_nombre: any[] = [];
  edit: any[] = [];
  editPack: any[] = [];
  modData: any = {
    ID: "",
    Grupo: "",
    Zona: "",
    Nombre: "",
    Codigo: "",
    Unidad: "",
    Stock_inicial: "",
    Stock_actual: "",
    Stocke: "",
    Offset_stocka: "",
    CantidadPaq: "",
    Stocka: "",
    Moneda: "",
    Compra: "",
    Venta: ""
  };
  modData_paquete: any = {
    ID: "",
    Paquete: "",
    Nombre: "",
    Cantidad: 0,
    PrecioUnitario: 0
  };

  borrarData: any = {
    Tabla: "",
    ID: "",
    Producto : ""
  };

  loading: boolean = false;
  perms: any = [];
  cols_stock: number;
  rows_stock: number;
  cols_precio: number;
  rows_precio: number;
  rows: number;
  private alive: boolean = true;
  bytes = crypto.AES.decrypt(localStorage.getItem("db"), "meraki");
  bd = this.bytes.toString(crypto.enc.Utf8);
  bdParsed = JSON.parse(this.bd);
  imageChanged : boolean = false;

  constructor(
    private inventariosService: InventariosService,
    private loginService: LoginService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {
    this.onChanges();
  }

  onChanges(): void {
    this.productoFilter.valueChanges
      .pipe(takeWhile(() => this.alive))
      .subscribe(val => {
        if (val !== "") {
          this.prodEscogido = val;
        } else this.prodEscogido = "";
      });
  }

  ngOnInit() {
    this.inventariosService.currentLoading
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.loading = res;
        this.cd.markForCheck();
      });
    this.inventariosService.currentDataProductos
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.data_ = res;
        this.productosFiltrados = res.slice();
        this.filteredOptions = this.productosFiltrados;

        for (var i = 0; i < this.data_.length; i++) {
          var key = "edit" + i;
          this.edit.push({
            name: key,
            value: false
          });
        }
      });

    this.inventariosService.currentDataPaquetes
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.paquetes = res;

        let _nombre = "";
        this.pack_nombre = [];
        this.paquetes.forEach(element => {
          if (element["Paquete"] != _nombre) {
            this.pack_nombre.push(element["Paquete"]);
            _nombre = element["Paquete"];
          }
        });

        for (var i = 0; i < this.paquetes.length; i++) {
          var key = "edit" + i;
          this.editPack.push({
            name: key,
            value: false
          });
        }
      });

    this.loginService.currentPermissions
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.perms = res;

        //Logica de permisos para tratar tablas
        this.cols_stock =
          this.perms[0]["pro_t_stockInicial"] +
          this.perms[0]["pro_t_stockActual"] +
          this.perms[0]["pro_t_stockEmergencia"] +
          this.perms[0]["pro_t_stockAlerta"];
        if (this.cols_stock === 0) {
          this.rows_stock = 1;
        } else {
          this.rows_stock = 2;
        }

        this.cols_precio =
          this.perms[0]["pro_t_precioCompra"] +
          this.perms[0]["pro_t_precioVenta"];
        if (this.cols_precio === 0) {
          this.rows_precio = 1;
        } else {
          this.rows_precio = 2;
        }

        if (this.rows_stock === 1 && this.rows_precio === 1) {
          this.rows = 1;
        } else {
          this.rows = 2;
        }
      });
  }

  tabChanged(e) {
    this.selectedIndex = e.index;
  }

  filterData() {
    this.productosFiltrados = this.data_.filter(
      value =>
        value["Grupo"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Nombre"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Zona"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Codigo"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Unidad"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Stock_inicial"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Stock_actual"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Stocke"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Offset_stocka"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Stocka"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Moneda"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Compra"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase()) ||
        value["Venta"]
          .toLowerCase()
          .startsWith(this.productoFilter.value.toLowerCase())
    );
  }

  pushKeyProducts() {
    this.filteredOptions = this.filterProducto(this.productoFilter.value);
    if (this.filteredOptions.length == 0)
      this.filteredOptions = this.productosFiltrados;
  }

  filterProducto(val): string[] {
    console.log(val);
    return this.productosFiltrados.filter(
      option => option.Nombre.toLowerCase().indexOf(val.toLowerCase()) === 0
    );
  }

  editAction(idx: number) {
    this.edit.forEach(element => {
      element["value"] = false;
    });
    this.edit[idx]["value"] = true;

    this.modData["ID"] = this.productosFiltrados[idx]["ID"];
    this.modData["Grupo"] = this.productosFiltrados[idx]["Grupo"];
    this.modData["Zona"] = this.productosFiltrados[idx]["Zona"];
    this.modData["Nombre"] = this.productosFiltrados[idx]["Nombre"];
    this.modData["Codigo"] = this.productosFiltrados[idx]["Codigo"];
    this.modData["Unidad"] = this.productosFiltrados[idx]["Unidad"];
    this.modData["Stock_inicial"] = this.productosFiltrados[idx][
      "Stock_inicial"
    ];
    this.modData["Stock_actual"] = this.productosFiltrados[idx]["Stock_actual"];
    this.modData["Stocke"] = this.productosFiltrados[idx]["Stocke"];
    this.modData["Offset_stocka"] = this.productosFiltrados[idx][
      "Offset_stocka"
    ];
    this.modData["Stocka"] = this.productosFiltrados[idx]["Stocka"];
    this.modData["Moneda"] = this.productosFiltrados[idx]["Moneda"];
    this.modData["Compra"] = this.productosFiltrados[idx]["Compra"];
    this.modData["Venta"] = this.productosFiltrados[idx]["Venta"];
  }

  saveAction(idx: number) {
    this.modData["Stocka"] =
      <number>this.modData["Stocke"] *
      (1 + <number>this.modData["Offset_stocka"] / 100);
    this.inventariosService.modificarProducto(this.modData);
    this.edit[idx]["value"] = false;
    this.imageChanged = false;
  }

  cancelAction(idx: number) {
    this.edit[idx]["value"] = false;
  }

  borrarAction(tabla: string, idx: number, producto : string) {
    this.borrarData["Tabla"] = tabla;
    this.borrarData["ID"] = idx;
    this.borrarData["Producto"] = producto;
    this.inventariosService.borrarItem(this.borrarData);
  }

  savePack(idx: number) {
    this.inventariosService.modificarPaquete(this.modData_paquete);
    this.editPack[idx]["value"] = false;
  }

  borrarPaq(pack: string) {
    this.inventariosService.borrarPaquete(pack);
  }

  editarPaq(idx: number) {
    this.editPack.forEach(element => {
      element["value"] = false;
    });
    this.editPack[idx]["value"] = true;

    this.modData_paquete["ID"] = this.paquetes[idx]["ID"];
    this.modData_paquete["Nombre"] = this.paquetes[idx]["Nombre"];
    this.modData_paquete["Cantidad"] = this.paquetes[idx]["Cantidad"];
    this.modData_paquete["PrecioUnitario"] = this.paquetes[idx][
      "PrecioUnitario"
    ];
  }

  openImageModal(i){
    let dataImagen = {
      imagen : this.productosFiltrados[i],
      editable : this.edit[i]["value"],
      bd : this.bdParsed
    }
    let dialogRef = this.dialog.open(ImagenComponent, {
      width: 'auto',
      data: dataImagen
    });

    dialogRef.beforeClose().subscribe(result => {
      if(result == 'true'){
        this.imageChanged = true;
      }
    });
  }

  cancelPack(idx: number) {
    this.editPack[idx]["value"] = false;
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
