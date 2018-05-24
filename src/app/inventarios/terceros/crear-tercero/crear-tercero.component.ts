import { InventariosService } from "./../../../servicios/almacenes/inventarios.service";
import { Router } from "@angular/router";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-crear-tercero",
  templateUrl: "./crear-tercero.component.html",
  styleUrls: ["./crear-tercero.component.css"]
})
export class CrearTerceroComponent implements OnInit {
  crearTerceroForm: FormGroup;

  documentos = [{ nombre: "RUC" }, { nombre: "DNI" }, { nombre: "OTRO" }];

  tipos = [
    { nombre: "PROVEEDOR" },
    { nombre: "CLIENTE" },
    { nombre: "INTERNO" }
  ];

  terceros: any[] = [];
  numeroExist: boolean = false;
  nombreExist: boolean = false;

  message: string = "Cambiar de: ";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private inventariosService: InventariosService,
    private snackBar: MatSnackBar,
    private cd : ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.crearTerceroForm = this.fb.group({
      Identi: ["", Validators.required],
      IdentiClass: ["", Validators.required],
      TerceroClass: ["", Validators.required],
      Nombre: ["", Validators.required],
      Direccion: ["", Validators.required],
      Contacto: ["", Validators.required],
      Mail: "",
      Telefono: ""
    });

    this.inventariosService.currentDataTerceros.subscribe(res => {
      this.terceros = res;
    });
  }

  onSubmit() {
    this.message = "Cambiar de: ";

    if (!this.numeroExist && !this.nombreExist) {
      this.inventariosService.crearTercero(this.crearTerceroForm.value, "0");
    } else {
      if (this.numeroExist && !this.nombreExist) {
        this.message += "N° de Documento";
      } else if (!this.numeroExist && this.nombreExist) {
        this.message += "Nombre";
      } else if (this.numeroExist && this.nombreExist) {
        this.message += "N° de Documento y Nombre";
      }
      this.snackBar.open(this.message, "Cerrar", {
        duration: 5000
      });
    }
    this.cd.markForCheck();
  }

  checkByNumero(target: string) {
    this.numeroExist = false;
    if (
      this.terceros.filter(tercero => tercero["Identi"] === target).length > 0
    ) {
      this.numeroExist = true;
    }
  }

  checkByNombre(target: string) {
    this.nombreExist = false;
    if (
      this.terceros.filter(tercero => tercero["Nombre"] === target).length > 0
    ) {
      this.nombreExist = true;
    }
  }
}
