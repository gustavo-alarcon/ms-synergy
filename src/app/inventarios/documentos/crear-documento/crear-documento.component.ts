import { MatSnackBar } from "@angular/material";
import { InventariosService } from "./../../../servicios/almacenes/inventarios.service";
import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";

@Component({
  selector: "app-crear-documento",
  templateUrl: "./crear-documento.component.html",
  styleUrls: ["./crear-documento.component.css"]
})
export class CrearDocumentoComponent implements OnInit {
  crearDocumentoForm: FormGroup;

  naturaleza = [
    { value: "ENTRADA" },
    { value: "SALIDA" },
    { value: "TRANSFERENCIA" },
    { value: "AJUSTE DE ENTRADA" },
    { value: "AJUSTE DE SALIDA" }
  ];

  tipos = [{ value: "PROVEEDOR" }, { value: "CLIENTE" }, { value: "INTERNO" }];

  documentos: any[] = [];

  abrevExist: boolean = false;
  nombreExist: boolean = false;

  message: string = "Cambiar de: ";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private inventariosService: InventariosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.crearDocumentoForm = this.fb.group({
      Abrev: ["", Validators.required],
      Nombre: ["", Validators.required],
      Tipo: ["", Validators.required],
      Naturaleza: ["", Validators.required],
      Numtienda: ["", Validators.required],
      CorrelativoInicial: ["", Validators.required],
      Uso: ""
    });

    this.inventariosService.currentDataDocumentos.subscribe(res => {
      this.documentos = res;
    });
  }

  onSubmit() {
    this.message = "Cambiar de: ";

    if (!this.abrevExist && !this.nombreExist) {
      this.inventariosService.crearDocumento(this.crearDocumentoForm.value);
    } else {
      if (this.abrevExist && !this.nombreExist) {
        this.message += "Abreviaura";
      } else if (!this.abrevExist && this.nombreExist) {
        this.message += "Nombre";
      } else if (this.abrevExist && this.nombreExist) {
        this.message += "Abreviatura y Nombre";
      }
      this.snackBar.open(this.message, "Cerrar", {
        duration: 5000
      });
    }
  }

  checkByAbrev(target: string) {
    this.abrevExist = false;
    if (
      this.documentos.filter(documento => documento["Abrev"] === target)
        .length > 0
    ) {
      this.abrevExist = true;
    }
  }

  checkByNombre(target: string) {
    this.nombreExist = false;
    if (
      this.documentos.filter(documento => documento["Nombre"] === target)
        .length > 0
    ) {
      this.nombreExist = true;
    }
  }
}
