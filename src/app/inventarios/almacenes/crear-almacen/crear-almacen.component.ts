import { InventariosService } from "./../../../servicios/almacenes/inventarios.service";
import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-crear-almacen",
  templateUrl: "./crear-almacen.component.html",
  styleUrls: ["./crear-almacen.component.css"]
})
export class CrearAlmacenComponent implements OnInit {
  crearAlmacenForm: FormGroup;
  almacenes: any[] = [];
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
    this.crearAlmacenForm = this.fb.group({
      abrev: ["", Validators.required],
      nombre: ["", Validators.required],
      dir: ["", Validators.required],
      supervisor: ["", Validators.required],
      mail: "",
      telefono: ""
    });

    this.inventariosService.currentDataAlmacenes.subscribe(res => {
      this.almacenes = res;
    });
  }

  onSubmit() {
    this.message = "Cambiar de: ";

    if (!this.abrevExist && !this.nombreExist) {
      this.inventariosService.crearAlmacen(this.crearAlmacenForm.value);
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
      this.almacenes.filter(almacen => almacen["Abrev"] === target).length > 0
    ) {
      this.abrevExist = true;
    }
  }

  checkByNombre(target: string) {
    this.nombreExist = false;
    if (
      this.almacenes.filter(almacen => almacen["Nombre"] === target).length > 0
    ) {
      this.nombreExist = true;
    }
  }
}
