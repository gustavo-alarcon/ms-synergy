import { LoginService } from './../../../servicios/login/login.service';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-crear-account',
  templateUrl: './crear-account.component.html',
  styleUrls: ['./crear-account.component.css']
})
export class CrearAccountComponent implements OnInit {

  crearCuentaForm: FormGroup;
  db: string;
  message: string;
  accountList: any[] = [];
  perms: any = [];
  userExist: boolean = false;

  constructor(private fb: FormBuilder,
              private snackBar: MatSnackBar,
              private loginService: LoginService) { }

  ngOnInit() {

    this.crearCuentaForm = this.fb.group({
      Nombre: ['', Validators.required],
      Apellido: ['', Validators.required],
      Correo: ['', Validators.email],
      Inventarios: '',
      Ventas: '',
      Servicios: '',
      Academia: '',
      Consultorio: '',
      Scrum: '',
      Web: '',
      Contabilidad: '',
      Robots: '',
    });
    
    this.loginService.currentPermissions.subscribe(res => {
      this.perms = res;

      this.crearCuentaForm.patchValue({
        Inventarios:this.perms[0]['Inventarios'],
        Ventas:this.perms[0]['Ventas'],
        Servicios:this.perms[0]['Servicios'],
        Academia:this.perms[0]['Academia'],
        Consultorio:this.perms[0]['Consultorio'],
        Scrum:this.perms[0]['Scrum'],
        Web:this.perms[0]['Web'],
        Contabilidad:this.perms[0]['Contabilidad'],
        Robots:this.perms[0]['Robots'],
      })
    });

    this.loginService.currentAccountList.subscribe(res => {
      this.accountList = res;
    });
  }

  onSubmit(){

    this.message = '';

    if (!this.userExist) {
      this.loginService.createAccount(this.crearCuentaForm.value);
    }else if (this.userExist){

      this.message += 'El usuario ya existe en el sistema';
      
      this.snackBar.open(this.message, 'Cerrar',{
        duration: 5000,
      });
    }
    
  }


  checkByUser(targetNombre:string, targetApellido:string) {
    this.userExist = false;
    if (this.accountList.filter(account => account['Name'] === targetNombre && account['Lastname'] === targetApellido).length > 0) {
      this.userExist = true;
    }
  }

}
