import { LoginService } from "./../../servicios/login/login.service";
import { InventariosService } from "./../../servicios/almacenes/inventarios.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-terceros",
  templateUrl: "./terceros.component.html",
  styleUrls: ["./terceros.component.css"]
})
export class TercerosComponent implements OnInit {
  tipoTercero: string = null;
  data_: any[] = [];
  tercerosFiltrados: any[] = [];
  edit: any[] = [];
  modData: any = {
    ID: "",
    TerceroClass: "",
    IdentiClass: "",
    Identi: "",
    Nombre: "",
    Direccion: "",
    Contacto: "",
    Mail: "",
    Telefono: ""
  };

  borrarData: any = {
    Tabla: "",
    ID: ""
  };

  loading: boolean = false;

  documentos = [{ nombre: "RUC" }, { nombre: "DNI" }, { nombre: "OTRO" }];

  tipos = [
    { nombre: "PROVEEDOR" },
    { nombre: "CLIENTE" },
    { nombre: "INTERNO" }
  ];

  perms: any = [];

  constructor(
    private inventariosService: InventariosService,
    private loginService: LoginService,
    private cd : ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.inventariosService.currentLoading.subscribe(res => {
      this.loading = res;
      this.cd.markForCheck();
    });

    this.inventariosService.currentDataTerceros.subscribe(res => {
      this.data_ = res;
      this.tercerosFiltrados = res.slice();

      for (var i = 0; i < this.data_.length; i++) {
        var key = "edit" + i;
        this.edit.push({
          name: key,
          value: false
        });
      }

      this.modData = Object.assign({}, res);
    });

    this.loginService.currentPermissions.subscribe(res => {
      this.perms = res;
    });
  }

  filterData(ref: string) {
    this.tercerosFiltrados = this.data_.filter(
      value =>
        value["Identi"].startsWith(ref) ||
        value["IdentiClass"].startsWith(ref) ||
        value["TerceroClass"].startsWith(ref) ||
        value["Nombre"].startsWith(ref) ||
        value["Ciudad"].startsWith(ref) ||
        value["Direccion"].startsWith(ref) ||
        value["Contacto"].startsWith(ref) ||
        value["Mail"].startsWith(ref) ||
        value["Telefono"].startsWith(ref)
    );
  }

  filterTercero() {
    this.tercerosFiltrados = this.data_.filter(value =>
      value["TerceroClass"]
        .toLowerCase()
        .startsWith(this.tipoTercero.toLowerCase())
    );
  }

  editAction(idx: number) {
    this.edit.forEach(element => {
      element["value"] = false;
    });
    this.edit[idx]["value"] = true;

    this.modData["ID"] = this.tercerosFiltrados[idx]["ID"];
    this.modData["TerceroClass"] = this.tercerosFiltrados[idx]["TerceroClass"];
    this.modData["IdentiClass"] = this.tercerosFiltrados[idx]["IdentiClass"];
    this.modData["Identi"] = this.tercerosFiltrados[idx]["Identi"];
    this.modData["Nombre"] = this.tercerosFiltrados[idx]["Nombre"];
    this.modData["Direccion"] = this.tercerosFiltrados[idx]["Direccion"];
    this.modData["Contacto"] = this.tercerosFiltrados[idx]["Contacto"];
    this.modData["Mail"] = this.tercerosFiltrados[idx]["Mail"];
    this.modData["Telefono"] = this.tercerosFiltrados[idx]["Telefono"];
  }

  saveAction(idx: number) {
    this.inventariosService.modificarTercero(this.modData);
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
