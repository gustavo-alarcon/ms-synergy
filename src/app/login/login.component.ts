import { Router } from '@angular/router';
import { LoginService } from './../servicios/login/login.service';
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginData: any;
  loginAuth: boolean;
  loginSend: boolean = false;
  loading: boolean = false;
  x='Hola';
  en;
  bdbytes;
  bd;

  constructor(private loginService: LoginService,
              private formBuilder: FormBuilder,
              private router: Router) {
              this.en  = crypto.AES.encrypt(this.x,"meraki");
              this.bdbytes = crypto.AES.decrypt(this.en,"meraki");
              this.bd = this.bdbytes.toString(crypto.enc.Utf8);

  }

  ngOnInit() {

    this.loginService.currentLoginAuth.subscribe(res => {
      this.loginAuth = res;
    });

    this.loginService.currentLoginSend.subscribe(res => {
      this.loginSend = res;
    });

    this.loginService.currentLoading.subscribe(res => {
      this.loading = res;
    });

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      userpassword: ['', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$')]]
    });
    
  }

  onSubmit() {
    this.loginSend = false; 
    this.loginData = this.saveLoginForm();
  }

  saveLoginForm() {

    this.loginService.checkLogin(this.loginForm.get('username').value,
                                 this.loginForm.get('userpassword').value); 
    this.loginService.queryLoading(true);
  }
}
