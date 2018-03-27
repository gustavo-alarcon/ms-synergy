import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { Injectable, OnDestroy } from '@angular/core';
import 'rxjs/Rx';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { MatSnackBar } from '@angular/material';
import * as crypto from 'crypto-js';
import { Observable } from 'rxjs/Observable';
import { ToastrService } from 'ngx-toastr'
import "rxjs/add/operator/takeWhile";


@Injectable()
export class LoginService {
  
  private alive: boolean = true;
  loginData: any;
  data: any[] = [];
  list: any[] = [];
  perm: any[] = [];
  db: string;
  name: string;
  web: string;

  private loginAuth = new BehaviorSubject<boolean>(false);
  currentLoginAuth = this.loginAuth.asObservable();

  private loginSend = new BehaviorSubject<boolean>(false);
  currentLoginSend = this.loginSend.asObservable();

  private userInfo = new BehaviorSubject<any[]>([{
    IDSynergy: '',
    Mail: '',
    Uname: '',
    Name: '',
    Lastname: '',
    Type: '',
    Db: '',
    Website: ''
  }]);
  currentUserInfo = this.userInfo.asObservable();

  private accountList = new BehaviorSubject<any[]>([]);
  currentAccountList = this.accountList.asObservable();

  private permissions = new BehaviorSubject<any[]>([]);
  currentPermissions = this.permissions.asObservable();

  private loading = new BehaviorSubject<boolean>(false);
  currentLoading = this.loading.asObservable();

  constructor(private http: Http,
    private router: Router,
    public snackBar: MatSnackBar,
    private toast: ToastrService) {
  }

  //GENERALES
  queryLoading(flag: boolean) {
    this.loading.next(flag);
  }

  checkLogin(username: string, userpass: string) {
    this.data = [];
    this.data.push({ uname: username, upass: userpass });

    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/login/checklogin.php?', JSON.stringify(this.data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/checklogin.php?', JSON.stringify(this.data))
      .takeWhile(() => this.alive)
      .subscribe(
        res => {
          let res_json = res.json();
          this.loginData = res_json['records'];
          if (this.loginData[0].IDSynergy === "false") {
            this.loginAuth.next(false);
            this.loginSend.next(true);
            this.queryLoading(false);
            this.toast.error('Usuario o Password incorrecto', 'Error');
          } else {
            this.web = crypto.AES.encrypt(JSON.stringify(res_json.records[0].Website), 'meraki');
            this.db = crypto.AES.encrypt(JSON.stringify(res_json.records[0].Db), 'meraki');
            this.name = crypto.AES.encrypt(JSON.stringify(username), 'meraki');
            localStorage.setItem("web", this.web.toString());
            localStorage.setItem("db", this.db.toString());
            localStorage.setItem("user", this.name.toString());
            this.userInfo.next(this.loginData);
            this.getCurrentPermissions(this.loginData, "check");
            this.toast.success('Bienvenido ' + res_json.records[0].Name + ' ' + res_json.records[0].Lastname, 'Exito');
          }
        },
        err => {
          console.log('login error:', err);
        }

      );
    return this.loginData;
  }

  getAccounts(data: any) {
    this.queryLoading(true);
    this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/handler-getaccounts.php?db=' + data)
      .takeWhile(() => this.alive)
      .subscribe(
        res => {
          let res_json = res.json();
          this.list = res_json['records'];
          this.accountList.next(this.list);
          this.queryLoading(false);
        },
        err => {
        }
      );
  }

  getCurrentPermissions(data: any, from: string) {
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-getcurrentpermissions.php?db=' + this.loginData[0]['Db'], JSON.stringify(data))
      .takeWhile(() => this.alive)
      .subscribe(
        res => {
          let res_json = res.json();
          this.perm = res_json['records'];
          this.permissions.next(this.perm);

          /*VIENE DE CHECKLOGIN*/
          if (from === "check") {
            this.loginAuth.next(true);
            this.router.navigate(['landing']);
            this.queryLoading(false);
            this.loginSend.next(true);
          }
        },
        err => {
        }
      );
  }

  updateAccount(data: any) {
    this.queryLoading(true);
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-updateaccperm.php?db=' + this.loginData[0]['Db'], JSON.stringify(data))
      .takeWhile(() => this.alive)
      .subscribe(
        res => {
          this.getAccounts(this.loginData[0]['Db']);
          this.getCurrentPermissions(this.loginData, "update");
        },
        err => {
        }
      );
  }

  logout() {
    this.loginAuth.next(false);
    this.loginSend.next(false);
  }

  clean() {
    this.loginData = [];
    this.userInfo.next([{
      ID: '',
      Mail: '',
      Uname: '',
      Name: '',
      Lastname: '',
      Type: '',
      Db: ''
    }]);
  }

  createAccount(data: JSON) {
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-accounts-cre.php?db=' + this.userInfo.getValue()[0]['Db'], JSON.stringify(data))
      .takeWhile(() => this.alive)
      .subscribe(
        res => {
          this.getAccounts(this.userInfo.getValue()[0]['Db']);
          this.router.navigate(['/config'])
          this.snackBar.open('Cuenta creada', 'Cerrar', {
            duration: 5000
          });
        },
        err => {
          this.snackBar.open(err, 'Cerrar', {
            duration: 5000
          });
        }
      );
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }


}
