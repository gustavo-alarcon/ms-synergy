
import { LoginService } from './../servicios/login/login.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  isAuth: boolean = false;

  constructor(private loginService: LoginService,
              private router: Router) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      
      this.loginService.currentLoginAuth.subscribe( res => {
        this.isAuth = res;
      });
      
      if(!this.isAuth) {
        this.router.navigate(['welcome']);
      }
      
      return this.isAuth;
  }
}

/*import { LoginService } from './../servicios/login/login.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../servicios/auth.service';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthGuard implements CanActivate {


  constructor(private loginService: LoginService,
              private router: Router,
              private authService : AuthService) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      console.log('LLEGGA');
      return this.authService.verifyAuth().map(data => {
        console.log(data);
        if(localStorage.getItem('db')!=null && localStorage.getItem('user')!=null){
          if(data.records[0].Auth=='false'){
            localStorage.removeItem('web');
            localStorage.removeItem('db');
            localStorage.removeItem('user');
            localStorage.removeItem('page');
            this.router.navigate(['']);
          }
          else{
            return true;
          }
        } 
        else{
          this.router.navigate(['welcome']);;
        } 
      }); 
  }
}
*/