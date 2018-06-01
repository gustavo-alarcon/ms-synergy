import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { InventariosService } from "../../../servicios/almacenes/inventarios.service";
import { takeWhile } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-num-series",
  templateUrl: "./num-series.component.html",
  styleUrls: ["./num-series.component.scss"]
})
export class NumSeriesComponent implements OnInit {
  isLoadingResults: boolean = false;
  numSeries = [];
  numSerieFiltrados = [];
  constructor(
    public DialogRef: MatDialogRef<NumSeriesComponent>,
    private inventariosService: InventariosService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public producto: any
  ) {}

  ngOnInit() {
    this.isLoadingResults = true;
    this.inventariosService
      .getNumSerie(this.producto.producto.Nombre)
      .subscribe(data => {
        this.numSeries = data.records;
        this.numSerieFiltrados = JSON.parse(JSON.stringify(this.numSeries));
        this.isLoadingResults = false;
      });
  }

  guardarCambios() {
    let changes = false;
    if (
      !this.numSeries.every((v, i) => {
        return v.comentario === this.numSerieFiltrados[i].comentario;
      })
    ) {
      changes = true;
    }
    if (
      !this.numSeries.every((v, i) => {
        return v.numSerie == this.numSerieFiltrados[i].numSerie;
      })
    ) {
      changes = true;
    }
    if (changes) {
      let numSerieTwice = false;
      for (let i = 0; i < this.numSeries.length; i++) {
        let times = 0;
        for (let j = 0; j < this.numSerieFiltrados.length; j++) {
          if (
            this.numSeries[i].numSerie == this.numSerieFiltrados[j].numSerie
          ) {
            times++;
          }
        }
        if (times >= 2) {
          numSerieTwice = true;
          this.toastr.warning(
            "El numero de serie " +
              this.numSeries[i].numSerie +
              " ya esta en uso, cambielo por favor",
            "Cuidado"
          );
        }
      }
      for (let i = 0; i < this.numSerieFiltrados.length; i++) {
        let serieCount = 0;
        for (let j = 0; j < this.numSerieFiltrados.length; j++) {
          if (
            this.numSerieFiltrados[i].numSerie ==
            this.numSerieFiltrados[j].numSerie
          ) {
            serieCount++;
          }
        }
        if (serieCount >= 2) {
          this.toastr.warning(
            "El numero de serie " +
              this.numSerieFiltrados[i].numSerie +
              " esta repetido dos o mas veces ",
            "Cuidado"
          );
          numSerieTwice = true;
          break;
        }
      }
      if (!numSerieTwice) {
        this.isLoadingResults = true;
        this.inventariosService
          .editNumSeries(
            this.numSeries,
            this.numSerieFiltrados,
            this.producto.producto.Nombre,
            this.producto.producto.Zona
          )
          .subscribe(
            data => {
              console.log(data);
              this.toastr.success(data, "Éxito");
              this.isLoadingResults = false;
              this.DialogRef.close("true");
            },
            err => {
              console.log(err);
            }
          );
      }
    } else {
      this.toastr.warning("No ha hecho ningun cambio", "Primero haga cambios");
    }
  }

  onNoClick() {
    this.DialogRef.close("false");
  }
}
