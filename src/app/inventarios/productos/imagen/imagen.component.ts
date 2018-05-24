import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { InventariosService } from "../../../servicios/almacenes/inventarios.service";
import { takeWhile } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-imagen",
  templateUrl: "./imagen.component.html",
  styleUrls: ["./imagen.component.css"]
})
export class ImagenComponent implements OnInit {
  imagenData;
  editable;
  bd;
  newImage;
  isLoadingResults = false;
  inputFile = {
    selectButton: {
      "background-color": "#fff",
      "border-radius": "10px",
      color: "#000"
    },
    clearButton: {
      "background-color": "#FFF",
      "border-radius": "10px",
      color: "#000",
      "margin-left": "10px"
    },
    layout: {
      "background-color": "#e7d0e7",
      "border-radius": "25px",
      color: "rgb(133, 81, 81)",
      "font-size": "10px",
      margin: "15px"
    },
    previewPanel: {
      "background-color": "rgb(188, 142, 188)",
      "border-radius": "0 0 10px 10px",
      display: "flex",
      "justify-content": "center"
    }
  };
  private alive: boolean = true;

  constructor(
    public DialogRef: MatDialogRef<ImagenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private inventarioService : InventariosService,
    private toastr : ToastrService
  ) {}

  ngOnInit() {
    this.imagenData = this.data.imagen;
    this.editable = this.data.editable;
    this.bd = this.data.bd;
  }

  imageFinishedUploading(file) {
    this.newImage = file.file;
  }

  onRemoved() {
    this.newImage = null;
  }

  changeImage() {
    if (this.newImage) {
      this.isLoadingResults = true;
      this.inventarioService
        .editarImagen(this.newImage, this.imagenData)
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          res => {
            this.toastr.success("Se cambio la imagen con exito", "Exito");
            this.isLoadingResults = false;
            this.DialogRef.close("true");
          },
          err => {
            this.toastr.error("Error de conexión", "Error");
            this.isLoadingResults = false;
          }
        );
    }
  }

  onNoClick() {
    this.DialogRef.close("false");
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
