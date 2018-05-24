import { InventariosService } from "./../../servicios/almacenes/inventarios.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { Angular2Csv } from "angular2-csv/Angular2-csv";
import { takeWhile } from "rxjs/operators";
import "rxjs/add/operator/takeWhile";

@Component({
  selector: "app-reportemov",
  templateUrl: "./reportemov.component.html",
  styleUrls: ["./reportemov.component.css"]
})
export class ReportemovComponent implements OnInit {
  nowFrom: any;
  nowTo: any;
  timeLimit: any;
  consulta: boolean = false;
  loading: boolean = false;
  queryDone: boolean = false;
  private alive: boolean = true;

  reportemov: any[] = [];
  naturaleza: any[] = [
    { nombre: "TODOS", value: "%" },
    { nombre: "ENTRADA", value: "ENTRADA" },
    { nombre: "SALIDA", value: "SALIDA" },
    { nombre: "TRANSFERENCIA", value: "TRANSFERENCIA" },
    { nombre: "AJUSTE DE ENTRADA", value: "AJUSTE DE ENTRADA" },
    { nombre: "AJUSTE DE SALIDA", value: "AJUSTE DE SALIDA" }
  ];

  total: number = 0;
  cantidadMovimientos: number = 0;
  productosMasRotado: any = [];

  mensajeReportemov: string = "Genere una consulta";
  movimiento: string = "";
  moneda: string = "";

  reportemovForm: FormGroup;

  separador: string = ",";
  separadorDecimal: string = ".";

  constructor(
    private fb: FormBuilder,
    private inventariosService: InventariosService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.reportemovForm = this.fb.group({
      FechaFrom: ["", Validators.required],
      FechaTo: ["", Validators.required],
      Movimiento: ["", Validators.required]
    });

    this.currentDate();
    this.reportemovForm.patchValue({
      FechaFrom: this.nowFrom,
      FechaTo: this.nowTo
    });

    this.inventariosService.currentLoading
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.loading = res;
        this.cd.markForCheck();
      });

    this.inventariosService.currentConsultaReportemovSend
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.consulta = res;
        this.cd.markForCheck();
      });

    this.inventariosService.currentMoneda
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.moneda = res;
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

    this.nowFrom = currentDate;
    this.nowTo = currentDate;
    this.timeLimit = limite;
    /*
    console.log(currentDate);
    console.log(currentDate.toDateString());
    console.log(currentDate.toISOString());
    console.log(currentDate.toJSON());
    console.log(currentDate.toLocaleDateString());
    console.log(currentDate.toLocaleString());
    console.log(currentDate.toLocaleTimeString());
    console.log(currentDate.toUTCString());
    console.log(currentDate.getTimezoneOffset());
    console.log(currentDate.getUTCFullYear());
    console.log(currentDate.getUTCMonth()+1);
    console.log(currentDate.getUTCDate());
    console.log(currentDate.getHours());
    console.log(currentDate.getMinutes());
    console.log(Date.now());
    console.log(Date.now().toLocaleString());*/
  }

  onInputFrom(event: any) {
    //console.log(event.value);
    this.reportemovForm.patchValue({ FechaFrom: event.value });
  }

  onChangeFrom(event: any) {
    //console.log(event.value);
    this.reportemovForm.patchValue({ FechaFrom: event.value });
  }

  onInputTo(event: any) {
    //console.log(event.value);
    this.reportemovForm.patchValue({ FechaTo: event.value });
  }

  onChangeTo(event: any) {
    //console.log(event.value);
    this.reportemovForm.patchValue({ FechaTo: event.value });
  }

  onSubmit() {
    this.consulta = false;

    this.inventariosService.consultaReportemov(this.reportemovForm.value);

    this.inventariosService.currentDataReportemov
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.reportemov = res;

        this.queryDone = true;

        if (this.reportemov.length < 1 && this.consulta) {
          this.mensajeReportemov = "No se encontraron resultados";
          this.consulta = false;
        } else {
          this.mensajeReportemov = "Genere una consulta";
        }

        this.total = 0;
        let temp_cantidad = 0;
        this.reportemov.forEach(element => {
          if (this.reportemovForm.value["Movimiento"] === "ENTRADA") {
            this.total = this.total + element["E_total"];
          } else if (this.reportemovForm.value["Movimiento"] === "SALIDA") {
            this.total = this.total + element["S_total"];
          }
        });

        this.movimiento = this.reportemovForm.value["Movimiento"];

        this.cantidadMovimientos = this.reportemov.length;
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

    let exportMovimientos = this.reportemov.slice();
    exportMovimientos.unshift({
      Fecha: "FECHA",
      Documento: "TIPO",
      Serie: "SERIE",
      Correlativo: "NÚMERO",
      Producto: "PRODUCTO",
      Movimiento: "MOVIMIENTO",
      E_cantidad: "E_CANTIDAD",
      E_costo: "E_COSTO_U",
      E_total: "E_TOTAL",
      S_cantidad: "S_CANTIDAD",
      S_costo: "S_COSTO_U",
      S_total: "S_TOTAL",
      Usuario: "USUARIO"
    });

    new Angular2Csv(exportMovimientos, "Movimientos", options);
  }

  configExportDec(dec: string) {
    this.separadorDecimal = dec;
  }

  configExportSep(sep: string) {
    this.separador = sep;
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
