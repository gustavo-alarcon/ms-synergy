import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { LoginService } from './../../../servicios/login/login.service';
import { InventariosService } from './../../../servicios/almacenes/inventarios.service';
import { Router } from '@angular/router';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { takeWhile } from "rxjs/operators";

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css']
})
export class AddClient2Component implements OnInit {

  crearTerceroForm: FormGroup;

  documentos = [
    { nombre: 'RUC' },
    { nombre: 'DNI' },
    { nombre: 'OTRO' }
  ];

  tipos = [
    { nombre: 'PROVEEDOR' },
    { nombre: 'CLIENTE' },
    { nombre: 'INTERNO' }
  ];

  terceros: any[] = [];
  numeroExist: boolean = false;
  nombreExist: boolean = false;

  message: string = 'Cambiar de: ';
  private alive: boolean = true;

  constructor(private fb: FormBuilder,
              private router: Router,
              private inventariosService: InventariosService,
              private snackBar: MatSnackBar,
              private DialogRef :   MatDialogRef<AddClient2Component>, 
            ) { }

  ngOnInit() {

    this.crearTerceroForm = this.fb.group({
      Identi: ['', Validators.required],
      IdentiClass: ['', Validators.required],
      TerceroClass: ['', Validators.required],
      Nombre: ['', Validators.required],
      Direccion: ['', Validators.required],
      Contacto: ['', Validators.required],
      Mail: '',
      Telefono: ''
    });

    this.inventariosService.currentDataTerceros
    .pipe(takeWhile(() => this.alive))
    .subscribe(res => {
      this.terceros = res;
    });

  }

  onSubmit() {
    this.message = 'Cambiar de: ';

    if (!this.numeroExist && !this.nombreExist) {
      this.inventariosService.crearTercero(this.crearTerceroForm.value,"1");
      this.DialogRef.close(true);
    }else{
      if (this.numeroExist && !this.nombreExist) {
        this.message += 'N° de Documento'
      }else if (!this.numeroExist && this.nombreExist) {
        this.message += 'Nombre'
      }else if (this.numeroExist && this.nombreExist) {
        this.message += 'N° de Documento y Nombre'
      }
      this.snackBar.open(this.message, 'Cerrar',{
        duration: 5000,
      });
    }
  }

  checkByNumero(target:string) {
    this.numeroExist = false;
    if (this.terceros.filter(tercero => tercero['Identi'] === target).length > 0) {
      this.numeroExist = true;
    }
  }

  checkByNombre(target:string) {
    this.nombreExist = false;
    if (this.terceros.filter(tercero => tercero['Nombre'] === target).length > 0) {
      this.nombreExist = true;
    }
  }

  onNoClick(){
    this.DialogRef.close(false);
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }

}
