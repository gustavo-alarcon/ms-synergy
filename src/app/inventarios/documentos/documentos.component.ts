import { InventariosService } from "./../../servicios/almacenes/inventarios.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { LoginService } from "../../servicios/login/login.service";

@Component({
  selector: "app-documentos",
  templateUrl: "./documentos.component.html",
  styleUrls: ["./documentos.component.css"]
})
export class DocumentosComponent implements OnInit {
  data_: any[];
  documentosFiltrados: any[] = [];
  edit: any[] = [];
  modData: any = {
    ID: "",
    Abrev: "",
    Nombre: "",
    Tipo: "",
    Naturaleza: "",
    Numtienda: "",
    Correlativo_inicial: "",
    Correlativo_actual: "",
    Uso: ""
  };

  borrarData: any = {
    Tabla: "",
    ID: ""
  };

  loading: boolean = false;
  perms: any = [];
  rows: number;
  cols: number;
  naturaleza = [
    { value: "ENTRADA" },
    { value: "SALIDA" },
    { value: "TRANSFERENCIA" },
    { value: "AJUSTE DE ENTRADA" },
    { value: "AJUSTE DE SALIDA" }
  ];

  tipos = [{ value: "PROVEEDOR" }, { value: "CLIENTE" }, { value: "INTERNO" }];

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

    this.inventariosService.currentDataDocumentos.subscribe(res => {
      this.data_ = res;
      this.documentosFiltrados = res.slice();

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

      //Logica de permisos para tratar tablas
      this.cols =
        this.perms[0]["doc_t_correlativoInicial"] +
        this.perms[0]["doc_t_correlativoActual"];
      if (this.cols === 0) {
        this.rows = 1;
      } else {
        this.rows = 2;
      }
    });
  }

  filterData(ref: string) {
    this.documentosFiltrados = this.data_.filter(
      value =>
        value["Abrev"].startsWith(ref) ||
        value["Nombre"].startsWith(ref) ||
        value["Tipo"].startsWith(ref) ||
        value["Naturaleza"].startsWith(ref) ||
        value["Numtienda"].startsWith(ref) ||
        value["Correlativo_inicial"].startsWith(ref) ||
        value["Correlativo_actual"].startsWith(ref) ||
        value["Uso"].startsWith(ref) ||
        value["Detalle"].startsWith(ref)
    );
  }

  editAction(idx: number) {
    this.edit.forEach(element => {
      element["value"] = false;
    });
    this.edit[idx]["value"] = true;

    this.modData["ID"] = this.documentosFiltrados[idx]["ID"];
    this.modData["Abrev"] = this.documentosFiltrados[idx]["Abrev"];
    this.modData["Nombre"] = this.documentosFiltrados[idx]["Nombre"];
    this.modData["Tipo"] = this.documentosFiltrados[idx]["Tipo"];
    this.modData["Naturaleza"] = this.documentosFiltrados[idx]["Naturaleza"];
    this.modData["Numtienda"] = this.documentosFiltrados[idx]["Numtienda"];
    this.modData["Correlativo_inicial"] = this.documentosFiltrados[idx][
      "Correlativo_inicial"
    ];
    this.modData["Correlativo_actual"] = this.documentosFiltrados[idx][
      "Correlativo_actual"
    ];
    this.modData["Uso"] = this.documentosFiltrados[idx]["Uso"];
  }

  saveAction(idx: number) {
    this.inventariosService.modificarDocumento(this.modData);
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
