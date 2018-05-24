import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import * as crypto from 'crypto-js';


@Injectable()
export class AuthService {
  url='http://www.meraki-s.com/rent/ms-synergy/php/checklogin.php?';
  bytesBD;
  bd;
  userBytes;
  user;
  auth;

  constructor(public http : HttpClient) { 
    this.verifyData();
  }

  verifyData(){
    if(localStorage.getItem('db')!=null && localStorage.getItem('user')!=null){
      this.bytesBD = crypto.AES.decrypt(localStorage.getItem('db'),'meraki');
      this.bd = this.bytesBD.toString(crypto.enc.Utf8);
      this.userBytes = crypto.AES.decrypt(localStorage.getItem('user'),'meraki')
      this.user = this.userBytes.toString(crypto.enc.Utf8);
      this.auth = {
        'name' : JSON.parse(this.user),
        'db' : JSON.parse(this.bd)
      };
    }
  }

  loginClient(client): Observable<any>{
    return this.http.post(this.url,JSON.stringify(client));
  }

  verifyAuth(): Observable<any>{
    this.verifyData();
    const headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding",
    });
    return this.http.post('https://cors-anywhere.herokuapp.com/http://www.meraki-s.com/rent/ms-synergy/php/checkAuth.php',JSON.stringify(this.auth),{headers:headers});
  }

}
