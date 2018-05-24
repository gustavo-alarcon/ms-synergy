import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { InventariosService } from "./../../servicios/almacenes/inventarios.service";
import { LoginService } from "../../servicios/login/login.service";

@Component({
  selector: "app-almacenes",
  templateUrl: "./almacenes.component.html",
  styleUrls: ["./almacenes.component.css"]
})
export class AlmacenesComponent implements OnInit {
  data_: any[] = [];
  almacenesFiltrados: any[] = [];
  edit: any[] = [];
  modData: any = {
    ID: "",
    Abrev: "",
    Nombre: "",
    Dir: "",
    Supervisor: "",
    Mail: "",
    Telefono: ""
  };

  borrarData: any = {
    Tabla: "",
    ID: ""
  };

  loading: boolean = false;
  perms: any = [];

  constructor(
    private inventariosService: InventariosService,
    private loginService: LoginService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.inventariosService.currentLoading.subscribe(res => {
      this.loading = res;
      this.cd.markForCheck();
    });

    this.inventariosService.currentDataAlmacenes.subscribe(res => {
      this.data_ = res;
      this.almacenesFiltrados = res.slice();

      for (var i = 0; i < this.data_.length; i++) {
        var key = "edit" + i;
        this.edit.push({
          name: key,
          value: false
        });
      }
    });

    this.loginService.currentPermissions.subscribe(res => {
      this.perms = res;
    });
  }

  filterData(ref: string) {
    this.almacenesFiltrados = this.data_.filter(
      value =>
        value["Abrev"].startsWith(ref) ||
        value["Nombre"].startsWith(ref) ||
        value["Dir"].startsWith(ref) ||
        value["Supervisor"].startsWith(ref) ||
        value["Mail"].startsWith(ref) ||
        value["Telefono"].startsWith(ref)
    );
  }

  editAction(idx: number) {
    this.edit.forEach(element => {
      element["value"] = false;
    });
    this.edit[idx]["value"] = true;

    this.modData["ID"] = this.almacenesFiltrados[idx]["ID"];
    this.modData["Abrev"] = this.almacenesFiltrados[idx]["Abrev"];
    this.modData["Nombre"] = this.almacenesFiltrados[idx]["Nombre"];
    this.modData["Dir"] = this.almacenesFiltrados[idx]["Dir"];
    this.modData["Supervisor"] = this.almacenesFiltrados[idx]["Supervisor"];
    this.modData["Mail"] = this.almacenesFiltrados[idx]["Mail"];
    this.modData["Telefono"] = this.almacenesFiltrados[idx]["Telefono"];
  }

  saveAction(idx: number) {
    this.inventariosService.modificarAlmacen(this.modData);
    this.edit[idx]["value"] = false;
  }

  cancelAction(idx: number) {
    this.edit[idx]["value"] = false;
  }

  borrarAction(tabla: string, idx: number) {
    this.borrarData["Tabla"] = tabla;
    this.borrarData["ID"] = idx;
    this.inventariosService.borrarItem(this.borrarData);
  }
}
