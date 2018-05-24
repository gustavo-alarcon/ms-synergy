import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Injectable()
export class AuthLoginGuard implements CanActivate {
  
  constructor(
    private router:Router, private authService : AuthService
  ){}
 
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
    return this.authService.verifyAuth().pipe(map(data => {
      if(localStorage.getItem('db')!=null && localStorage.getItem('user')!=null){
        if(data.records[0].Auth=='false'){
          localStorage.removeItem('web');
          localStorage.removeItem('db');
          localStorage.removeItem('user');
          localStorage.removeItem('page');
          return true;
        }
        else{
          this.router.navigate(['landing']);
        }
      } 
      else{
        return true;
      } 
    }));        
  }
}
