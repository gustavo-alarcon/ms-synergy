import { Router } from "@angular/router";
import { Almacen } from "../../interfaces/almacenes";
import { LoginService } from "./../login/login.service";
import {
  Headers,
  Http,
  Response,
  RequestOptions,
  ResponseType
} from "@angular/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { takeWhile, map } from "rxjs/operators";

@Injectable()
export class InventariosService {
  db: string;
  private alive: boolean = true;
  private dataAlmacenes = new BehaviorSubject<any[]>([]);
  currentDataAlmacenes = this.dataAlmacenes.asObservable();
  private dataTerceros = new BehaviorSubject<any[]>([]);
  currentDataTerceros = this.dataTerceros.asObservable();
  private dataDocumentos = new BehaviorSubject<any[]>([]);
  currentDataDocumentos = this.dataDocumentos.asObservable();
  private dataGrupos = new BehaviorSubject<any[]>([]);
  currentDataGrupos = this.dataGrupos.asObservable();
  private dataProductos = new BehaviorSubject<any[]>([]);
  currentDataProductos = this.dataProductos.asObservable();
  private dataPaquetes = new BehaviorSubject<any[]>([]);
  currentDataPaquetes = this.dataPaquetes.asObservable();
  private dataKardex = new BehaviorSubject<any[]>([]);
  currentDataKardex = this.dataKardex.asObservable();
  private dataStock = new BehaviorSubject<any[]>([]);
  currentDataStock = this.dataStock.asObservable();
  private dataReportemov = new BehaviorSubject<any[]>([]);
  currentDataReportemov = this.dataReportemov.asObservable();

  private loading = new BehaviorSubject<boolean>(true);
  currentLoading = this.loading.asObservable();

  private consultaKardexSend = new BehaviorSubject<boolean>(false);
  currentConsultaKardexSend = this.consultaKardexSend.asObservable();

  private consultaStockSend = new BehaviorSubject<boolean>(false);
  currentConsultaStockSend = this.consultaStockSend.asObservable();

  private consultaReportemovSend = new BehaviorSubject<boolean>(false);
  currentConsultaReportemovSend = this.consultaReportemovSend.asObservable();

  private moneda = new BehaviorSubject<string>("");
  currentMoneda = this.moneda.asObservable();

  simTime: number = 0;
  toastrDuration: number = 10000;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private http2: HttpClient
  ) {
    this.loginService.currentUserInfo
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.db = res[0]["Db"];
        this.getAlmacenes();
        this.getTerceros();
        this.getDocumentos();
        this.getGrupos();
        this.getProductos();
        this.getPaquetes();
      });
  }
  //GENERALES
  queryLoading(flag: boolean) {
    this.loading.next(flag);
  }

  borrarItem(data: JSON) {
    this.queryLoading(true);

    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-borrar-item.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          switch (data["Tabla"]) {
            case "zonas_sucursales":
              this.toastr.success("Almacen: " + res, "Exito");
              this.getAlmacenes();
              this.router.navigate(["inventarios/almacenes"]);
              break;
            case "terceros":
              this.toastr.success("Terceros: " + res, "Exito");
              this.getTerceros();
              this.router.navigate(["inventarios/terceros"]);
              break;
            case "documentos":
              this.toastr.success("Documentos: " + res, "Exito");
              this.getDocumentos();
              this.router.navigate(["inventarios/documentos"]);
              break;
            case "grupos":
              this.toastr.success("Grupos: " + res, "Exito");
              this.getGrupos();
              this.router.navigate(["inventarios/grupos"]);
              break;
            case "productos":
              this.toastr.success("Productos: " + res, "Exito");
              this.getProductos();
              this.router.navigate(["inventarios/productos"]);
              break;
            default:
              break;
          }
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  exportData(data: any) {
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-exportdata.php",
        JSON.stringify(data),
        { responseType: "text" }
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.toastr.success(res, "Exito");
      });
  }

  // ALMACENES
  getAlmacenes() {
    //this.http2.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/ZS_mysql.php?db='+this.db)
    this.http2
      .get(
        "http://www.meraki-s.com/rent/ms-synergy/php/ZS_mysql.php?db=" + this.db
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        data => {
          setTimeout(() => {
            this.dataAlmacenes.next(data["records"]);
            this.queryLoading(false);
          }, this.simTime);
        },
        err => {
          this.toastr.error("Error de conexión", "error");
          this.queryLoading(false);
        }
      );
  }

  crearAlmacen(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-almacenes-cre.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-almacenes-cre.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getAlmacenes();
          this.router.navigate(["inventarios/almacenes"]);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  modificarAlmacen(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-almacenes-mod.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-almacenes-mod.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getAlmacenes();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  // TERCEROS
  getTerceros() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/terceros_mysql.php?db='+this.db)
    this.http2
      .get(
        "http://www.meraki-s.com/rent/ms-synergy/php/terceros_mysql.php?db=" +
          this.db
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        data => {
          setTimeout(() => {
            this.dataTerceros.next(data["records"]);
            this.queryLoading(false);
          }, this.simTime);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  crearTercero(data: JSON, page) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-terceros-cre.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-terceros-cre.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getTerceros();
          if (page == "0") this.router.navigate(["inventarios/terceros"]);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  modificarTercero(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-terceros-mod.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-terceros-mod.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getTerceros();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  // DOCUMENTOS
  getDocumentos() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/documentos_mysql.php?db='+this.db)
    this.http2
      .get(
        "http://www.meraki-s.com/rent/ms-synergy/php/documentos_mysql.php?db=" +
          this.db
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        data => {
          setTimeout(() => {
            this.dataDocumentos.next(data["records"]);
            this.queryLoading(false);
          }, this.simTime);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  crearDocumento(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-documentos-cre.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-documentos-cre.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getDocumentos();
          this.router.navigate(["inventarios/documentos"]);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  modificarDocumento(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-documentos-mod.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-documentos-mod.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getDocumentos();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  guardarImagen(fileToUpload: File) {
    let formData = new FormData();
    formData.append("file", fileToUpload, fileToUpload.name);
    return this.http2.post(
      "http://www.meraki-s.com/rent/ms-synergy/php/test/upload_image.php?db=" +
        this.db,
      formData,
      { responseType: "text" }
    );
  }

  editarImagen(fileToUpload: File, producto) {
    let formData = new FormData();
    formData.append("file", fileToUpload, fileToUpload.name);
    return this.http2.post(
      "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-image-edit.php?db=" +
        this.db +
        "&imgName=" +
        producto.Imagen +
        "&productCod=" +
        producto.Codigo,
      formData,
      { responseType: "text" }
    );
  }

  getAllProducts(): Observable<any> {
    return this.http2.get(
      "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-getAllProducts.php"
    );
  }

  actualizarCorrelativo(data: JSON) {
    this.queryLoading(true);

    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-paquetes-bor.php?db='+this.db, data)
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-documentos-corr.php?db=" +
          this.db,
        JSON.stringify(data)
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          /*
          this.toastr.warning(res.text(), 'Cerrar',{
            duration: this.toastrDuration
          });*/
          this.getDocumentos();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  // GRUPOS
  getGrupos() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/grupos_mysql.php?db='+this.db)
    this.http2
      .get(
        "http://www.meraki-s.com/rent/ms-synergy/php/grupos_mysql.php?db=" +
          this.db
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        data => {
          setTimeout(() => {
            this.dataGrupos.next(data["records"]);
            this.queryLoading(false);
          }, this.simTime);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  crearGrupo(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-grupos-cre.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-grupos-cre.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getGrupos();
          this.router.navigate(["inventarios/grupos"]);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  modificarGrupo(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-grupos-mod.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-grupos-mod.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getGrupos();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  // PRODUCTOS
  getProductos() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/productos_mysql.php?db='+this.db)
    this.http2
      .get(
        "http://www.meraki-s.com/rent/ms-synergy/php/productos_mysql.php?db=" +
          this.db
      )

      .pipe(takeWhile(() => this.alive))
      .subscribe(
        data => {
          setTimeout(() => {
            this.dataProductos.next(data["records"]);
            this.queryLoading(false);
          }, this.simTime);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  crearProducto(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-productos-cre.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-productos-cre.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getProductos();
          this.router.navigate(["inventarios/productos"]);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  getNumSerie(tn): Observable<any> {
    return this.http2.get(
      "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-getNumSeriexProduct.php?db=" +
        this.db +
        "&tn=" +
        tn
    );
  }

  getProductoSerie(data): Observable<any> {
    return this.http2.post(
      "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-producto&serie.php?db=" +
        this.db,
      JSON.stringify(data)
    );
  }

  modificarProducto(cambios, original) {
    this.queryLoading(true);
    let data = {
      cambios: cambios,
      original: original
    };
    console.log(data);
    this.http2
      .post(
        /*"http://www.meraki-s.com/rent/ms-synergy/php/handler-productos-mod.php?db=" */
        "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-productos-mod.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          console.log(res);
          this.toastr.success(res, "Exito");
          this.getProductos();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  actualizarStock(data: JSON) {
    this.queryLoading(true);
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-productos-stock.php?db=" +
          this.db,
        JSON.stringify(data)
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          //this.toastr.success(res.text(), "Exito");
          this.getProductos();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  transferirProducto(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-productos-tra.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-productos-tra.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          let message = res;
          this.toastr.success("Se transfirio el producto", "Exito");
          this.getProductos();
        },
        err => {
          this.toastr.error("Error de conexión", "Cerrar");
          this.queryLoading(false);
        }
      );
  }

  //PAQUETE
  getPaquetes() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/paquetes_mysql.php?db='+this.db)
    this.http2
      .get(
        "http://www.meraki-s.com/rent/ms-synergy/php/paquetes_mysql.php?db=" +
          this.db
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        data => {
          setTimeout(() => {
            this.dataPaquetes.next(data["records"]);
            this.queryLoading(false);
          }, this.simTime);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  crearPaquete(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-paquetes-cre.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-paquetes-cre.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getPaquetes();
          this.router.navigate(["inventarios/productos"]);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  modificarPaquete(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-paquetes-mod.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-paquetes-mod.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getPaquetes();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  borrarPaquete(data: string) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-paquetes-bor.php?db='+this.db, data)
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/handler-paquetes-bor.php?db=" +
          this.db,
        data,
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success(res, "Exito");
          this.getPaquetes();
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  //REGISTRAR MOVIMIENTO
  registrarMovimiento(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-movimientos-reg.php?db='+this.db, JSON.stringify(data))
    // this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-movimientos-reg.php?db=' + this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-movimientos-reg.php?db=" +
          this.db,
        JSON.stringify(data),
        { responseType: "text" }
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.toastr.success("Se registro el movimiento", "Exito");
          this.queryLoading(false);
          this.router.navigate(["inventarios/movimientos"]);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          console.log(err);
          this.queryLoading(false);
        }
      );
  }

  //CONSULTA DE KARDEX
  consultaKardex(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/kardex_mysql.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/kardex_mysql.php?db=" +
          this.db,
        JSON.stringify(data)
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.dataKardex.next(res["records"]);
          this.queryLoading(false);
          this.consultaKardexSend.next(true);
        },
        err => {
          this.toastr.error("Error de conexión", "Error");
          this.queryLoading(false);
        }
      );
  }

  //CONSULTA DE STOCK
  consultaStock(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/stock_mysql.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/stock_mysql.php?db=" +
          this.db,
        JSON.stringify(data)
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.dataStock.next(res["records"]);
          this.queryLoading(false);
          this.consultaStockSend.next(true);
        },
        err => {
          this.toastr.error("Error de conexión:" + err, "Error");
          this.queryLoading(false);
        }
      );
  }

  //CONSULTA DE MOVIMIENTO
  consultaReportemov(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/stock_mysql.php?db='+this.db, JSON.stringify(data))
    this.http2
      .post(
        "http://www.meraki-s.com/rent/ms-synergy/php/reportemov_mysql.php?db=" +
          this.db,
        JSON.stringify(data)
      )
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.dataReportemov.next(res["records"]);
          this.queryLoading(false);
          this.consultaReportemovSend.next(true);
          this.moneda.next(res["records"][0]["Moneda"]);
          this.toastr.success("Listo!", "Exito");
        },
        err => {
          this.toastr.error(err, "Error");
          this.queryLoading(false);
        }
      );
  }

  getHistorial(): Observable<any> {
    return this.http2.get(
      "http://www.meraki-s.com/rent/ms-synergy/php/handler-movimientos-historial.php?db=" +
        this.db
    );
  }

  generarSeries(data) {
    return this.http2.post(
      "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-generar-series.php?db=" +
        this.db,
      JSON.stringify(data),
      { responseType: "text" }
    );
  }

  editNumSeries(antiguo, nuevo, producto, almacen) {
    let data = {
      antiguo: antiguo,
      nuevo: nuevo,
      producto: producto,
      almacen: almacen
    };
    return this.http2.post(
      "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-edit-num-serie.php?db=" +
        this.db,
      JSON.stringify(data),
      { responseType: "text" }
    );
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
