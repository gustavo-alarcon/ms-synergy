import { Component, OnInit } from '@angular/core';
import { LoginService } from '../servicios/login/login.service';
import { trigger,state,style,transition,animate,keyframes,query,stagger } from '@angular/animations';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  animations : [
    trigger('menuInOut',[
      state('close',style({opacity : 0, display : 'none'})),
      transition('close => open', animate('500ms ease-in', keyframes([
        style({display:'block' , opacity: 0, offset: 0}),
        style({opacity: 0.5, offset: 0.5}),
        style({opacity: 1, offset: 1.0}),
      ]))),
      transition('open => close',animate('500ms ease-in', keyframes([
        style({opacity: 1, offset: 0}),
        style({opacity: 0.5,  offset: 0.5}),
        style({opacity: 0, display:'none' , offset: 1.0}),
      ]))),
    ])
  ]
})
export class LandingComponent implements OnInit {

  username: string = 'Usuario'
  perms: any = [{

  }];
  menu : string = 'close';

  constructor(private loginService: LoginService) { }

  ngOnInit() {

    this.loginService.currentPermissions.subscribe(res => {
      this.perms = res;
    });
  }

  openMenu(){
      this.menu = (this.menu === 'close' ? 'open' : 'close');
  }

  createPage(){
    localStorage.setItem('page', '1');
  }

}
