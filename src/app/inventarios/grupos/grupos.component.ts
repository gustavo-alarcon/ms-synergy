import { LoginService } from "./../../servicios/login/login.service";
import { InventariosService } from "./../../servicios/almacenes/inventarios.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-grupos",
  templateUrl: "./grupos.component.html",
  styleUrls: ["./grupos.component.css"]
})
export class GruposComponent implements OnInit {
  data_: any[];
  gruposFiltrados: any[] = [];
  edit: any[] = [];
  modData: any = {
    ID: "",
    Nombre: "",
    Detalles: ""
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
    private cd : ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.inventariosService.currentLoading.subscribe(res => {
      this.loading = res;
      this.cd.markForCheck();
    });

    this.inventariosService.currentDataGrupos.subscribe(res => {
      this.data_ = res;
      this.gruposFiltrados = res.slice();

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
    this.gruposFiltrados = this.data_.filter(
      value =>
        value["Nombre"].startsWith(ref) || value["Detalles"].startsWith(ref)
    );
  }

  editAction(idx: number) {
    this.edit.forEach(element => {
      element["value"] = false;
    });
    this.edit[idx]["value"] = true;

    this.modData["ID"] = this.gruposFiltrados[idx]["ID"];
    this.modData["Nombre"] = this.gruposFiltrados[idx]["Nombre"];
    this.modData["Detalles"] = this.gruposFiltrados[idx]["Detalles"];
  }

  saveAction(idx: number) {
    this.inventariosService.modificarGrupo(this.modData);
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
