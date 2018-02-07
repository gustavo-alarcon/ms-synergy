import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import 'rxjs/add/operator/map'



@Injectable()
export class Auth2Guard implements CanActivate {

  constructor(private router:Router, private authService : AuthService){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
      return this.authService.verifyAuth().map(data => {
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
