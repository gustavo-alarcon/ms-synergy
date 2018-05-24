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
  selector: "app-crear-grupo",
  templateUrl: "./crear-grupo.component.html",
  styleUrls: ["./crear-grupo.component.css"]
})
export class CrearGrupoComponent implements OnInit {
  crearGruposForm: FormGroup;

  grupos: any[] = [];

  nombreExist: boolean = false;

  message: string = "Cambiar de: ";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private inventariosService: InventariosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.crearGruposForm = this.fb.group({
      Nombre: ["", Validators.required],
      Detalles: ""
    });

    this.inventariosService.currentDataGrupos.subscribe(res => {
      this.grupos = res;
    });
  }

  onSubmit() {
    this.message = "Cambiar de: ";

    if (!this.nombreExist) {
      this.inventariosService.crearGrupo(this.crearGruposForm.value);
    } else {
      this.message += "Nombre";

      this.snackBar.open(this.message, "Cerrar", {
        duration: 5000
      });
    }
  }

  checkByNombre(target: string) {
    this.nombreExist = false;
    if (this.grupos.filter(grupo => grupo["Nombre"] === target).length > 0) {
      this.nombreExist = true;
    }
  }
}
