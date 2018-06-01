import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { InventariosService } from "../../../servicios/almacenes/inventarios.service";
import { takeWhile } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-generar-serie",
  templateUrl: "./generar-serie.component.html",
  styleUrls: ["./generar-serie.component.scss"]
})
export class GenerarSerieComponent implements OnInit {
  productosFiltrados: any[] = [];
  private alive: boolean = true;
  data: any[] = [];
  filteredOptions: any = [];
  isLoadingResults: boolean = false;

  constructor(
    public DialogRef: MatDialogRef<GenerarSerieComponent>,
    private inventariosService: InventariosService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.inventariosService.currentDataProductos
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.data = res.filter(
          (s1, pos, arr) =>
            arr.findIndex(
              s2 =>
                s2.Codigo === s1.Codigo &&
                (s1.Serie_actual == "" || s1.Serie_actual == null)
            ) === pos
        );
        for (let i = 0; i < this.data.length; i++) {
          this.data[i].Serie_actual = 0;
        }
        this.productosFiltrados = JSON.parse(JSON.stringify(this.data));
        this.filteredOptions = this.productosFiltrados;
      });
  }

  generarSeries() {
    if (
      !this.data.every((v, i) => {
        return v.Serie_actual === this.productosFiltrados[i].Serie_actual;
      })
    ) {
      this.isLoadingResults = true;
      this.inventariosService
        .generarSeries(this.productosFiltrados)
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          res => {
            this.isLoadingResults = false;
            this.toastr.success(res, "Exito");
            this.DialogRef.close("false");
          },
          err => {
            this.toastr.error(err, "Error");
            this.isLoadingResults = false;
          }
        );
    } else {
      this.toastr.warning("No ha hecho ningun cambio", "Primero haga cambios");
    }
  }

  onNoClick() {
    this.DialogRef.close("false");
  }
}
