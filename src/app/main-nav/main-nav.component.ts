import { LoginService } from './../servicios/login/login.service';
import { Component, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material';

import {FormControl} from '@angular/forms';
//import {MdIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})

export class MainNavComponent implements OnInit {

  currentUser: any[] = [];
  isAuth: boolean = false;

  myControl: FormControl = new FormControl();

  constructor(sanitizer: DomSanitizer,
              private loginService: LoginService) {
  }

  ngOnInit() {
    this.loginService.currentUserInfo.subscribe(res => {
      this.currentUser = res;
    });
    
    this.loginService.currentLoginAuth.subscribe(res => {
      this.isAuth = res;
    });
  }

  logout() {
    this.loginService.logout();
    this.loginService.clean();
    localStorage.removeItem('web');
    localStorage.removeItem('db');
    localStorage.removeItem('user');
    localStorage.removeItem('page');
    localStorage.removeItem('list');
    localStorage.removeItem('tab');
  }

}
