import { Component, OnInit } from '@angular/core';
import { LoginService } from '../servicios/login/login.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  username: string = 'Usuario'
  perms: any = [{

  }];

  constructor(private loginService: LoginService) { }

  ngOnInit() {

    this.loginService.currentPermissions.subscribe(res => {
      this.perms = res;
    });
  }

}
