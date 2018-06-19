import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { LoginService } from "./../../servicios/login/login.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-config-account",
  templateUrl: "./config-account.component.html",
  styleUrls: ["./config-account.component.css"]
})
export class ConfigAccountComponent implements OnInit {
  name: string = "";
  lastname: string = "";
  isAuth: boolean = false;
  loading: boolean = true;
  editMode: boolean = false;
  accountList: any[] = [];
  currentUser: any[] = [];
  currentIdx: number;
  currentIdxUser: number;
  edit: any[] = [];
  borrarData = {
    Tabla: null,
    ID: null
  };
  inputFile = {
    selectButton: {
      "background-color": "#fff",
      "border-radius": "10px",
      color: "#000"
    },
    clearButton: {
      "background-color": "#FFF",
      "border-radius": "10px",
      color: "#000",
      "margin-left": "10px"
    },
    layout: {
      "background-color": "#e7d0e7",
      "border-radius": "25px",
      color: "rgb(133, 81, 81)",
      "font-size": "10px",
      margin: "15px"
    },
    previewPanel: {
      "background-color": "rgb(188, 142, 188)",
      "border-radius": "0 0 10px 10px",
      display: "flex",
      "justify-content": "center"
    }
  };
  modAccountForm: FormGroup;
  clientForm: FormGroup;
  newImage;

  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientForm = this.fb.group({
      ruc: [null, Validators.compose([Validators.required])],
      rs: [null, Validators.compose([Validators.required])],
      nombreComercial: [null, Validators.compose([Validators.required])],
      direccion: [null, Validators.compose([Validators.required])],
      tel1: [null, Validators.compose([Validators.required])],
      tel2: [null, Validators.compose([Validators.required])],
      nombreSucursal: [null, Validators.compose([Validators.required])]
    });

    this.modAccountForm = this.fb.group({
      ID: "",
      IDSynergy: "",
      Name: "",
      Lastname: "",
      Uname: "",
      Password: "",
      Mail: "",
      Type: "",

      alm_seccion: "",
      alm_b_crear: "",
      alm_b_editar: "",
      alm_b_guardar: "",
      alm_b_borrar: "",
      alm_t_direccion: "",
      alm_t_supervisor: "",
      alm_t_mail: "",
      alm_t_telefono: "",

      ter_seccion: "",
      ter_b_crear: "",
      ter_b_editar: "",
      ter_b_guardar: "",
      ter_b_borrar: "",
      ter_t_direccion: "",
      ter_t_contacto: "",
      ter_t_mail: "",
      ter_t_telefono: "",

      doc_seccion: "",
      doc_b_crear: "",
      doc_b_editar: "",
      doc_b_guardar: "",
      doc_b_borrar: "",
      doc_t_serie: "",
      doc_t_correlativoInicial: "",
      doc_t_correlativoActual: "",
      doc_t_modo: "",

      gru_seccion: "",
      gru_b_crear: "",
      gru_b_editar: "",
      gru_b_guardar: "",
      gru_b_borrar: "",

      pro_seccion: "",
      pro_b_crearPaquete: "",
      pro_b_editarPaquete: "",
      pro_b_guardarPaquete: "",
      pro_b_borrarPaquete: "",
      pro_b_crearProducto: "",
      pro_b_editarProducto: "",
      pro_b_guardarProducto: "",
      pro_b_borrarProducto: "",
      pro_p_paquetes: "",
      pro_p_productos: "",
      pro_d_cantidad: "",
      pro_d_precio: "",
      pro_t_stockInicial: "",
      pro_t_stockActual: "",
      pro_t_stockEmergencia: "",
      pro_t_stockAlerta: "",
      pro_t_moneda: "",
      pro_t_precioCompra: "",
      pro_t_precioVenta: "",

      reg_seccion: "",
      reg_doc_entrada: "",
      reg_doc_salida: "",
      reg_doc_transferencia: "",
      reg_doc_ajusteEntrada: "",
      reg_doc_ajusteSalida: "",
      reg_t_prodPrecioCompra: "",
      reg_t_paqPrecioCompra: "",

      kardex_seccion: "",
      stock_seccion: "",
      movimientos_seccion: ""
    });

    this.loginService.currentLoading.subscribe(res => {
      this.loading = res;
      this.cd.markForCheck();
    });

    this.loginService.currentUserInfo.subscribe(res => {
      this.currentUser = res;

      this.loginService.getAccounts(this.currentUser[0]["Db"]);
    });

    this.loginService.currentUserInfo.subscribe(res => {
      this.name = res[0]["Name"];
      this.lastname = res[0]["Lastname"];
    });

    this.loginService.currentLoginAuth.subscribe(res => {
      this.isAuth = res;
    });

    this.loginService.currentAccountList.subscribe(res => {
      this.accountList = res;
      console.log(this.accountList);
      for (var i = 0; i < this.accountList.length; i++) {
        this.edit.push({
          value: false
        });
      }
    });
  }

  editAction(idx: number, idx_user: number) {
    this.modAccountForm.patchValue({
      ID: this.accountList[idx]["ID"],
      IDSynergy: this.accountList[idx]["IDSynergy"],
      Name: this.accountList[idx]["Name"],
      Lastname: this.accountList[idx]["Lastname"],
      Uname: this.accountList[idx]["Uname"],
      Password: this.accountList[idx]["Password"],
      Mail: this.accountList[idx]["Mail"],
      Type: this.accountList[idx]["Type"],

      alm_seccion: this.accountList[idx]["alm_seccion"],
      alm_b_crear: this.accountList[idx]["alm_b_crear"],
      alm_b_editar: this.accountList[idx]["alm_b_editar"],
      alm_b_guardar: this.accountList[idx]["alm_b_guardar"],
      alm_b_borrar: this.accountList[idx]["alm_b_borrar"],
      alm_t_direccion: this.accountList[idx]["alm_t_direccion"],
      alm_t_supervisor: this.accountList[idx]["alm_t_supervisor"],
      alm_t_mail: this.accountList[idx]["alm_t_mail"],
      alm_t_telefono: this.accountList[idx]["alm_t_telefono"],

      ter_seccion: this.accountList[idx]["ter_seccion"],
      ter_b_crear: this.accountList[idx]["ter_b_crear"],
      ter_b_editar: this.accountList[idx]["ter_b_editar"],
      ter_b_guardar: this.accountList[idx]["ter_b_guardar"],
      ter_b_borrar: this.accountList[idx]["ter_b_borrar"],
      ter_t_direccion: this.accountList[idx]["ter_t_direccion"],
      ter_t_contacto: this.accountList[idx]["ter_t_contacto"],
      ter_t_mail: this.accountList[idx]["ter_t_mail"],
      ter_t_telefono: this.accountList[idx]["ter_t_telefono"],

      doc_seccion: this.accountList[idx]["doc_seccion"],
      doc_b_crear: this.accountList[idx]["doc_b_crear"],
      doc_b_editar: this.accountList[idx]["doc_b_editar"],
      doc_b_guardar: this.accountList[idx]["doc_b_guardar"],
      doc_b_borrar: this.accountList[idx]["doc_b_borrar"],
      doc_t_serie: this.accountList[idx]["doc_t_serie"],
      doc_t_correlativoInicial: this.accountList[idx][
        "doc_t_correlativoInicial"
      ],
      doc_t_correlativoActual: this.accountList[idx]["doc_t_correlativoActual"],
      doc_t_modo: this.accountList[idx]["doc_t_modo"],

      gru_seccion: this.accountList[idx]["gru_seccion"],
      gru_b_crear: this.accountList[idx]["gru_b_crear"],
      gru_b_editar: this.accountList[idx]["gru_b_editar"],
      gru_b_guardar: this.accountList[idx]["gru_b_guardar"],
      gru_b_borrar: this.accountList[idx]["gru_b_borrar"],

      pro_seccion: this.accountList[idx]["pro_seccion"],
      pro_b_crearPaquete: this.accountList[idx]["pro_b_crearPaquete"],
      pro_b_editarPaquete: this.accountList[idx]["pro_b_editarPaquete"],
      pro_b_guardarPaquete: this.accountList[idx]["pro_b_guardarPaquete"],
      pro_b_borrarPaquete: this.accountList[idx]["pro_b_borrarPaquete"],
      pro_b_crearProducto: this.accountList[idx]["pro_b_crearProducto"],
      pro_b_editarProducto: this.accountList[idx]["pro_b_editarProducto"],
      pro_b_guardarProducto: this.accountList[idx]["pro_b_guardarProducto"],
      pro_b_borrarProducto: this.accountList[idx]["pro_b_borrarProducto"],
      pro_p_paquetes: this.accountList[idx]["pro_p_paquetes"],
      pro_p_productos: this.accountList[idx]["pro_p_productos"],
      pro_d_cantidad: this.accountList[idx]["pro_d_cantidad"],
      pro_d_precio: this.accountList[idx]["pro_d_precio"],
      pro_t_stockInicial: this.accountList[idx]["pro_t_stockInicial"],
      pro_t_stockActual: this.accountList[idx]["pro_t_stockActual"],
      pro_t_stockEmergencia: this.accountList[idx]["pro_t_stockEmergencia"],
      pro_t_stockAlerta: this.accountList[idx]["pro_t_stockAlerta"],
      pro_t_moneda: this.accountList[idx]["pro_t_moneda"],
      pro_t_precioCompra: this.accountList[idx]["pro_t_precioCompra"],
      pro_t_precioVenta: this.accountList[idx]["pro_t_precioVenta"],

      reg_seccion: this.accountList[idx]["reg_seccion"],
      reg_doc_entrada: this.accountList[idx]["reg_doc_entrada"],
      reg_doc_salida: this.accountList[idx]["reg_doc_salida"],
      reg_doc_transferencia: this.accountList[idx]["reg_doc_transferencia"],
      reg_doc_ajusteEntrada: this.accountList[idx]["reg_doc_ajusteEntrada"],
      reg_doc_ajusteSalida: this.accountList[idx]["reg_doc_ajusteSalida"],
      reg_t_prodPrecioCompra: this.accountList[idx]["reg_t_prodPrecioCompra"],
      reg_t_paqPrecioCompra: this.accountList[idx]["reg_t_paqPrecioCompra"],

      kardex_seccion: this.accountList[idx]["kardex_seccion"],
      stock_seccion: this.accountList[idx]["stock_seccion"],
      movimientos_seccion: this.accountList[idx]["movimientos_seccion"]
    });

    this.edit.forEach(element => {
      element["value"] = false;
    });
    this.edit[idx]["value"] = true;
    this.editMode = true;

    this.currentIdx = idx;
    this.currentIdxUser = idx_user;
  }

  saveAction(idx: number) {
    this.modAccountForm.patchValue({
      alm_seccion: this.filterValue(this.modAccountForm.value["alm_seccion"]),
      alm_b_crear: this.filterValue(this.modAccountForm.value["alm_b_crear"]),
      alm_b_editar: this.filterValue(this.modAccountForm.value["alm_b_editar"]),
      alm_b_guardar: this.filterValue(
        this.modAccountForm.value["alm_b_guardar"]
      ),
      alm_b_borrar: this.filterValue(this.modAccountForm.value["alm_b_borrar"]),
      alm_t_direccion: this.filterValue(
        this.modAccountForm.value["alm_t_direccion"]
      ),
      alm_t_supervisor: this.filterValue(
        this.modAccountForm.value["alm_t_supervisor"]
      ),
      alm_t_mail: this.filterValue(this.modAccountForm.value["alm_t_mail"]),
      alm_t_telefono: this.filterValue(
        this.modAccountForm.value["alm_t_telefono"]
      ),

      ter_seccion: this.filterValue(this.modAccountForm.value["ter_seccion"]),
      ter_b_crear: this.filterValue(this.modAccountForm.value["ter_b_crear"]),
      ter_b_editar: this.filterValue(this.modAccountForm.value["ter_b_editar"]),
      ter_b_guardar: this.filterValue(
        this.modAccountForm.value["ter_b_guardar"]
      ),
      ter_b_borrar: this.filterValue(this.modAccountForm.value["ter_b_borrar"]),
      ter_t_direccion: this.filterValue(
        this.modAccountForm.value["ter_t_direccion"]
      ),
      ter_t_contacto: this.filterValue(
        this.modAccountForm.value["ter_t_contacto"]
      ),
      ter_t_mail: this.filterValue(this.modAccountForm.value["ter_t_mail"]),
      ter_t_telefono: this.filterValue(
        this.modAccountForm.value["ter_t_telefono"]
      ),

      doc_seccion: this.filterValue(this.modAccountForm.value["doc_seccion"]),
      doc_b_crear: this.filterValue(this.modAccountForm.value["doc_b_crear"]),
      doc_b_editar: this.filterValue(this.modAccountForm.value["doc_b_editar"]),
      doc_b_guardar: this.filterValue(
        this.modAccountForm.value["doc_b_guardar"]
      ),
      doc_b_borrar: this.filterValue(this.modAccountForm.value["doc_b_borrar"]),
      doc_t_serie: this.filterValue(this.modAccountForm.value["doc_t_serie"]),
      doc_t_correlativoInicial: this.filterValue(
        this.modAccountForm.value["doc_t_correlativoInicial"]
      ),
      doc_t_correlativoActual: this.filterValue(
        this.modAccountForm.value["doc_t_correlativoActual"]
      ),
      doc_t_modo: this.filterValue(this.modAccountForm.value["doc_t_modo"]),

      gru_seccion: this.filterValue(this.modAccountForm.value["gru_seccion"]),
      gru_b_crear: this.filterValue(this.modAccountForm.value["gru_b_crear"]),
      gru_b_editar: this.filterValue(this.modAccountForm.value["gru_b_editar"]),
      gru_b_guardar: this.filterValue(
        this.modAccountForm.value["gru_b_guardar"]
      ),
      gru_b_borrar: this.filterValue(this.modAccountForm.value["gru_b_borrar"]),

      pro_seccion: this.filterValue(this.modAccountForm.value["pro_seccion"]),
      pro_b_crearPaquete: this.filterValue(
        this.modAccountForm.value["pro_b_crearPaquete"]
      ),
      pro_b_editarPaquete: this.filterValue(
        this.modAccountForm.value["pro_b_editarPaquete"]
      ),
      pro_b_guardarPaquete: this.filterValue(
        this.modAccountForm.value["pro_b_guardarPaquete"]
      ),
      pro_b_borrarPaquete: this.filterValue(
        this.modAccountForm.value["pro_b_borrarPaquete"]
      ),
      pro_b_crearProducto: this.filterValue(
        this.modAccountForm.value["pro_b_crearProducto"]
      ),
      pro_b_editarProducto: this.filterValue(
        this.modAccountForm.value["pro_b_editarProducto"]
      ),
      pro_b_guardarProducto: this.filterValue(
        this.modAccountForm.value["pro_b_guardarProducto"]
      ),
      pro_b_borrarProducto: this.filterValue(
        this.modAccountForm.value["pro_b_borrarProducto"]
      ),
      pro_p_paquetes: this.filterValue(
        this.modAccountForm.value["pro_p_paquetes"]
      ),
      pro_p_productos: this.filterValue(
        this.modAccountForm.value["pro_p_productos"]
      ),
      pro_d_cantidad: this.filterValue(
        this.modAccountForm.value["pro_d_cantidad"]
      ),
      pro_d_precio: this.filterValue(this.modAccountForm.value["pro_d_precio"]),
      pro_t_stockInicial: this.filterValue(
        this.modAccountForm.value["pro_t_stockInicial"]
      ),
      pro_t_stockActual: this.filterValue(
        this.modAccountForm.value["pro_t_stockActual"]
      ),
      pro_t_stockEmergencia: this.filterValue(
        this.modAccountForm.value["pro_t_stockEmergencia"]
      ),
      pro_t_stockAlerta: this.filterValue(
        this.modAccountForm.value["pro_t_stockAlerta"]
      ),
      pro_t_moneda: this.filterValue(this.modAccountForm.value["pro_t_moneda"]),
      pro_t_precioCompra: this.filterValue(
        this.modAccountForm.value["pro_t_precioCompra"]
      ),
      pro_t_precioVenta: this.filterValue(
        this.modAccountForm.value["pro_t_precioVenta"]
      ),

      reg_seccion: this.filterValue(this.modAccountForm.value["reg_seccion"]),
      reg_doc_entrada: this.filterValue(
        this.modAccountForm.value["reg_doc_entrada"]
      ),
      reg_doc_salida: this.filterValue(
        this.modAccountForm.value["reg_doc_salida"]
      ),
      reg_doc_transferencia: this.filterValue(
        this.modAccountForm.value["reg_doc_transferencia"]
      ),
      reg_doc_ajusteEntrada: this.filterValue(
        this.modAccountForm.value["reg_doc_ajusteEntrada"]
      ),
      reg_doc_ajusteSalida: this.filterValue(
        this.modAccountForm.value["reg_doc_ajusteSalida"]
      ),
      reg_t_prodPrecioCompra: this.filterValue(
        this.modAccountForm.value["reg_t_prodPrecioCompra"]
      ),
      reg_t_paqPrecioCompra: this.filterValue(
        this.modAccountForm.value["reg_t_paqPrecioCompra"]
      ),

      kardex_seccion: this.filterValue(
        this.modAccountForm.value["kardex_seccion"]
      ),
      stock_seccion: this.filterValue(
        this.modAccountForm.value["stock_seccion"]
      ),
      movimientos_seccion: this.filterValue(
        this.modAccountForm.value["movimientos_seccion"]
      )
    });

    this.loginService.updateAccount(this.modAccountForm.value);
    this.edit[this.currentIdx]["value"] = false;
  }

  cancelAction(idx: number) {
    this.edit[idx]["value"] = false;
    this.editMode = false;
  }

  borrarAction(idAccount: number) {
    this.borrarData.Tabla = "users";
    this.borrarData.ID = idAccount;
    this.loginService.deleteAccount(this.borrarData);
    this.edit[this.currentIdx]["value"] = false;
    this.editMode = false;
  }

  closeEditAction() {
    this.edit.forEach(element => {
      element["value"] = false;
    });
    this.editMode = false;
  }

  filterValue(value: any) {
    if (value === true || value === 1) {
      return 1;
    } else if (value === false || value === 0) {
      return 0;
    }
  }

  imageFinishedUploading(file) {
    this.newImage = file.file;
  }

  onRemoved() {
    this.newImage = null;
  }
}
