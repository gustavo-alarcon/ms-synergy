import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URLSearchParams, Headers } from '@angular/http';
import {  BaseRequestOptions, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs';
import * as crypto from 'crypto-js';

@Injectable()
export class MessagesService {
  p = {
    authId: 'MAYZKXNWE0ZWI1MTBKOG',
    authToken: 'MjY1YmEzMGQ5NWQ5ZDhhYjk4YmZjOGE3NDlkMmVi'
  };

  bytes = crypto.AES.decrypt(localStorage.getItem('db'),'meraki');
  bd = this.bytes.toString(crypto.enc.Utf8);

  constructor(public http: HttpClient) { }

  addClient(client,db){
    let headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding",
  });
    return this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-addCustomer.php?db='+db,JSON.stringify(client));
  }

  sendMessages(messages){
    let headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding",
    });
    return this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-addToCrono.php?db='+JSON.parse(this.bd),JSON.stringify(messages),{responseType: 'text' });
  }
  
  getBubbleValues(): Observable<any>{
    return this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/handler-getTextValues.php?db='+JSON.parse(this.bd));
  }

  getMessages(db): Observable<any>{
    return this.http.get("http://www.meraki-s.com/rent/ms-synergy/php/handler-getcustomers-sms.php?db="+JSON.parse(db));
  }

}
