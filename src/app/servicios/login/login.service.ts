import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { MatSnackBar } from '@angular/material';

@Injectable()
export class LoginService {

  loginData: any;
  data: any[] = [];
  list: any[] = [];
  perm: any[] = [];

  private loginAuth = new BehaviorSubject<boolean>(false);
  currentLoginAuth = this.loginAuth.asObservable();

  private loginSend = new BehaviorSubject<boolean>(false);
  currentLoginSend = this.loginSend.asObservable();

  private userInfo = new BehaviorSubject<any[]>([{
    IDSynergy:'',
    Mail:'',
    Uname:'',
    Name:'',
    Lastname:'',
    Type:'',
    Db:''
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
              public snackBar: MatSnackBar) {
  }

  //GENERALES
  queryLoading(flag: boolean) {
    this.loading.next(flag);
  }

  checkLogin(username: string, userpass: string) {
    this.data = [];
    this.data.push({uname: username, upass: userpass});
    
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/login/checklogin.php?', JSON.stringify(this.data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/checklogin.php?', JSON.stringify(this.data))
      .subscribe(
        res => {
          
          let res_json = res.json();
          this.loginData = res_json['records'];
          if(this.loginData[0].IDSynergy === "false") {
            this.loginAuth.next(false);
            this.loginSend.next(true);
            this.queryLoading(false);
          }else{
            this.userInfo.next(this.loginData);
            
            this.getCurrentPermissions(this.loginData, "check");
          }
        },
        err => {
          console.log('login error:', err);
        }
      );
  }

  getAccounts(data: any){
    this.queryLoading(true);
    this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/handler-getaccounts.php?db='+data)
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

  getCurrentPermissions(data: any, from: string){
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-getcurrentpermissions.php?db='+this.loginData[0]['Db'],JSON.stringify(data))
    .subscribe(
      res => {
        let res_json = res.json();
        this.perm = res_json['records'];
        this.permissions.next(this.perm);

        /*VIENE DE CHECKLOGIN*/
        if(from === "check"){
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

  updateAccount(data: any){
    console.log(data);
    this.queryLoading(true);
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-updateaccperm.php?db='+this.loginData[0]['Db'],JSON.stringify(data))
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
    window.location.replace('http://www.meraki-s.com/rent/ms-synergy/');
  }

  clean() {
    this.loginData = [];
    this.userInfo.next([{
      ID:'',
      Mail:'',
      Uname:'',
      Name:'',
      Lastname:'',
      Type:'',
      Db:''
    }]);
  }

  createAccount(data: JSON){
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-accounts-cre.php?db='+this.userInfo.getValue()[0]['Db'], JSON.stringify(data))
      .subscribe(
        res => {
          this.getAccounts(this.userInfo.getValue()[0]['Db']);
          this.router.navigate(['/config'])
          this.snackBar.open('Cuenta creada', 'Cerrar',{
            duration: 5000
          });
        },
        err => {
          this.snackBar.open(err, 'Cerrar',{
            duration: 5000
          });
        }
      );
  }

}
