import { LoginService } from './../servicios/login/login.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

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
