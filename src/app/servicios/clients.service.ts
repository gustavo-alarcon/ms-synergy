import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ClientsService {
  url='http://qtalrolloice.com/';
  constructor(public http: HttpClient) { }
//agregar bd
  getClientFranchise(): Observable<any>{
    return this.http.get(this.url+'getCustomersFra.php');
  }

  getClientSales(): Observable<any>{
    return this.http.get(this.url+'getCustomersProm.php');
  }

  getBdClient(bd): Observable<any>{
    return this.http.get("http://www.meraki-s.com/rent/ms-synergy/php/handler-getcustomers-sms.php?db="+JSON.parse(bd));
  }


}
