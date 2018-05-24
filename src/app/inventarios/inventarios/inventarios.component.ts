import { LoginService } from "./../../servicios/login/login.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-inventarios",
  templateUrl: "./inventarios.component.html",
  styleUrls: ["./inventarios.component.css"]
})
export class InventariosComponent implements OnInit {
  perms: any = [];

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    this.loginService.currentPermissions.subscribe(res => {
      this.perms = res;
    });
  }
}
