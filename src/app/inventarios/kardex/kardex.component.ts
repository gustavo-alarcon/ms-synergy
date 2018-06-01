import { log } from "util";
import { InventariosService } from "./../../servicios/almacenes/inventarios.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { Angular2Csv } from "angular2-csv/Angular2-csv";

@Component({
  selector: "app-kardex",
  templateUrl: "./kardex.component.html",
  styleUrls: ["./kardex.component.css"]
})
export class KardexComponent implements OnInit {
  now: any;
  timeLimit: any;
  consulta: boolean = false;
  loading: boolean = false;
  queryDone: boolean = false;

  almacenes: any[] = [];
  productos: any[] = [];
  productos_filtrado: any[] = [];
  kardex: any[] = [];

  sum_entrada = 0;
  sum_salida = 0;
  moneda: string = "";
  stock_inicial: string = "";
  stock_actual: string = "";
  mensajeKardex: string = "Genere una consulta";

  separadorDecimal: string = ".";
  separador: string = ",";

  kardexForm: FormGroup;

  constructor(
    private inventariosService: InventariosService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.kardexForm = this.fb.group({
      Fecha: ["", Validators.required],
      Almacen: ["", Validators.required],
      IDProd: ["", Validators.required],
      Unidad: ""
    });

    this.currentDate();
    this.kardexForm.patchValue({ Fecha: this.now });

    this.inventariosService.currentLoading.subscribe(res => {
      this.loading = res;
      this.cd.markForCheck();
    });

    this.inventariosService.currentConsultaKardexSend.subscribe(res => {
      this.consulta = res;
    });

    this.inventariosService.currentDataAlmacenes.subscribe(res => {
      this.almacenes = res;
      this.almacenes.sort(this.sortBy("Nombre"));
    });

    this.inventariosService.currentDataProductos.subscribe(res => {
      this.productos = res;
      this.productos.sort(this.sortBy("Nombre"));
    });
  }

  currentDate() {
    const currentDate = new Date();
    /*
    if(currentDate.getDate() + 1 < 10){
      var limite = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-0'+(currentDate.getDate()+1);
    }else{
      var limite = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+(currentDate.getDate()+1);
    }*/

    if (31 < 31) {
      if (31 + 1 < 10) {
        if (currentDate.getMonth() + 1 < 10) {
          var limite =
            currentDate.getFullYear() +
            "-0" +
            (currentDate.getMonth() + 1) +
            "-0" +
            (31 + 1) % 31;
        } else {
          var limite =
            currentDate.getFullYear() +
            "-" +
            (currentDate.getMonth() + 1) +
            "-0" +
            (31 + 1) % 31;
        }
      } else {
        if (currentDate.getMonth() + 1 < 10) {
          var limite =
            currentDate.getFullYear() +
            "-0" +
            (currentDate.getMonth() + 1) +
            "-" +
            (31 + 1) % 31;
        } else {
          var limite =
            currentDate.getFullYear() +
            "-" +
            (currentDate.getMonth() + 1) +
            "-" +
            (31 + 1) % 31;
        }
      }
    } else {
      if (currentDate.getMonth() + 1 < 12) {
        if ((currentDate.getMonth() + 2) % 13 + 1 < 10) {
          var limite =
            currentDate.getFullYear() +
            "-0" +
            ((currentDate.getMonth() + 2) % 13 + 1) +
            "-0" +
            1;
        } else {
          var limite =
            currentDate.getFullYear() +
            "-" +
            ((currentDate.getMonth() + 2) % 13 + 1) +
            "-0" +
            1;
        }
      } else {
        if ((currentDate.getMonth() + 2) % 13 + 1 < 10) {
          var limite =
            currentDate.getFullYear() +
            1 +
            "-0" +
            ((currentDate.getMonth() + 2) % 13 + 1) +
            "-0" +
            1;
        } else {
          var limite =
            currentDate.getFullYear() +
            1 +
            "-" +
            ((currentDate.getMonth() + 2) % 13 + 1) +
            "-0" +
            1;
        }
      }
    }

    this.now = currentDate;
    this.timeLimit = limite;
  }

  sortBy(key) {
    return function(a, b) {
      if (a[key] > b[key]) {
        return 1;
      } else if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    };
  }

  filtrarProductos(alm: string) {
    this.productos_filtrado = [];

    this.productos.forEach(element => {
      if (element["Zona"] === alm) {
        this.productos_filtrado.push(element);
      }
    });
  }

  setUnit(idx: any) {
    let indice = this.productos.findIndex(i => i.ID === idx);
    this.kardexForm.patchValue({
      Unidad: this.productos[indice]["Unidad"]
    });
    this.moneda = this.productos[indice]["Moneda"];
    this.stock_actual = this.productos[indice]["Stock_actual"];
    this.stock_inicial = this.productos[indice]["Stock_inicial"];
  }

  onInput(event: any) {
    this.kardexForm.patchValue({ Fecha: event.value });
  }

  onChange(event: any) {
    this.kardexForm.patchValue({ Fecha: event.value });
  }

  onSubmit() {
    this.consulta = false;
    this.kardex = [];
    this.inventariosService.consultaKardex(this.kardexForm.value);

    this.inventariosService.currentDataKardex.subscribe(res => {
      this.kardex = res;

      this.kardex.unshift({
        Fecha: "",
        Documento: "STOCK INICIAL",
        Serie: "",
        Correlativo: "",
        Movimiento: "",
        E_cantidad: 0,
        E_costo: 0,
        E_total: 0,
        S_cantidad: 0,
        S_costo: 0,
        S_total: 0,
        Stock: this.stock_inicial,
        SL_costo: 0,
        SL_total: 0
      });

      this.queryDone = true;

      if (this.kardex.length == 0 && this.consulta) {
        this.mensajeKardex = "No se encontraron resultados";
        this.consulta = false;
      }

      this.sum_entrada = 0;
      this.sum_salida = 0;
      this.kardex.forEach(element => {
        this.sum_entrada = this.sum_entrada + element["E_total"];
        this.sum_salida = this.sum_salida + element["S_total"];
      });
    });
  }

  exportData() {
    let options = {
      fieldSeparator: this.separador,
      quoteStrings: '"',
      decimalseparator: this.separadorDecimal,
      showLabels: false,
      showTitle: false,
      useBom: false
    };

    let exportKardex = this.kardex.slice();

    exportKardex.unshift({
      Fecha: "FECHA",
      Documento: "TIPO",
      Serie: "SERIE",
      Correlativo: "NÚMERO",
      Movimiento: "TIPO DE OPERACIÓN",
      E_cantidad: "E_CANTIDAD",
      E_costo: "E_COSTO_U",
      E_total: "E_TOTAL",
      S_cantidad: "S_CANTIDAD",
      S_costo: "S_COSTO_U",
      S_total: "S_TOTAL",
      Stock: "STOCK_CANTIDAD",
      SL_costo: "STOCK_COSTO_U",
      SL_total: "STOCK_TOTAL",
      Stock_inicial: "STOCK_INICIAL"
    });

    new Angular2Csv(exportKardex, "Kardex", options);
  }

  configExportDec(dec: string) {
    this.separadorDecimal = dec;
  }

  configExportSep(sep: string) {
    this.separador = sep;
  }
}
