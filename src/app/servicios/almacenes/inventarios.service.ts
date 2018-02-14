import { Router } from '@angular/router';
import { Almacen } from "../../interfaces/almacenes";
import { LoginService } from './../login/login.service';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { MatSnackBar } from '@angular/material';

@Injectable()
export class InventariosService {

  db: string;

  private dataAlmacenes   = new BehaviorSubject<any[]>([]);
  currentDataAlmacenes    = this.dataAlmacenes.asObservable();
  private dataTerceros    = new BehaviorSubject<any[]>([]);
  currentDataTerceros     = this.dataTerceros.asObservable();
  private dataDocumentos  = new BehaviorSubject<any[]>([]);
  currentDataDocumentos   = this.dataDocumentos.asObservable();
  private dataGrupos      = new BehaviorSubject<any[]>([]);
  currentDataGrupos       = this.dataGrupos.asObservable();
  private dataProductos   = new BehaviorSubject<any[]>([]);
  currentDataProductos    = this.dataProductos.asObservable();
  private dataPaquetes    = new BehaviorSubject<any[]>([]);
  currentDataPaquetes     = this.dataPaquetes.asObservable();
  private dataKardex      = new BehaviorSubject<any[]>([]);
  currentDataKardex       = this.dataKardex.asObservable();
  private dataStock       = new BehaviorSubject<any[]>([]);
  currentDataStock        = this.dataStock.asObservable();
  private dataReportemov  = new BehaviorSubject<any[]>([]);
  currentDataReportemov   = this.dataReportemov.asObservable();

  private loading = new BehaviorSubject<boolean>(true);
  currentLoading = this.loading.asObservable();

  private consultaKardexSend = new BehaviorSubject<boolean>(false);
  currentConsultaKardexSend = this.consultaKardexSend.asObservable();

  private consultaStockSend = new BehaviorSubject<boolean>(false);
  currentConsultaStockSend = this.consultaStockSend.asObservable();

  private consultaReportemovSend = new BehaviorSubject<boolean>(false);
  currentConsultaReportemovSend = this.consultaReportemovSend.asObservable();

  private moneda = new BehaviorSubject<string>('');
  currentMoneda = this.moneda.asObservable();

  simTime: number = 0;
  snackDuration: number = 10000;

  constructor(private http: Http,
              private loginService: LoginService,
              private router: Router,
              public snackBar: MatSnackBar) {

    this.loginService.currentUserInfo.subscribe(res => {
      this.db = res[0]['Db'];
    });

    this.getAlmacenes();
    this.getTerceros();
    this.getDocumentos();
    this.getGrupos();
    this.getProductos();
    this.getPaquetes();
  }
  //GENERALES
  queryLoading(flag: boolean) {
    this.loading.next(flag);
  }

  borrarItem(data: JSON){
    this.queryLoading(true);
    
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-borrar-item.php?db='+this.db, JSON.stringify(data))
    .subscribe(
      res => {
        
        switch (data['Tabla']) {
          case 'zonas_sucursales':
            this.snackBar.open('Almacen: ' + res.text(), 'Cerrar',{
              duration: 6000
            });
            this.getAlmacenes();
            this.router.navigate(['inventarios/almacenes']);
            break;
          case 'terceros':
            this.snackBar.open('Terceros: ' + res.text(), 'Cerrar',{
              duration: 6000
            });
            this.getTerceros();
            this.router.navigate(['inventarios/terceros']);
            break;
          case 'documentos':
            this.snackBar.open('Documentos: ' + res.text(), 'Cerrar',{
              duration: 6000
            });
            this.getDocumentos();
            this.router.navigate(['inventarios/documentos']);
            break;
          case 'grupos':
            this.snackBar.open('Grupos: ' + res.text(), 'Cerrar',{
              duration: 6000
            });
            this.getGrupos();
            this.router.navigate(['inventarios/grupos']);
            break;
          case 'productos':
            this.snackBar.open('Productos: ' + res.text(), 'Cerrar',{
              duration: 6000
            });
            this.getProductos();
            this.router.navigate(['inventarios/productos']);
            break;
          default:
            break;
        }
        
      },
      err => {
        this.snackBar.open('Error de conexión', 'Cerrar',{
          duration: this.snackDuration
        });
        this.queryLoading(false);
      }
    );
  }

  exportData(data: any){

    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-exportdata.php', JSON.stringify(data))
      .subscribe( 
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
      })
  }

  // ALMACENES
  getAlmacenes() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/ZS_mysql.php?db='+this.db)
    this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/ZS_mysql.php?db='+this.db, )
      .map(
        res => res.json()
      )
      .subscribe( data => {
        setTimeout(() => {
          this.dataAlmacenes.next(data['records']);
          this.queryLoading(false);
        }, this.simTime);
          
      },
      err => {
        this.snackBar.open('Error de conexión', 'Cerrar',{
          duration: this.snackDuration
        });
        this.queryLoading(false);
      });
  }

  crearAlmacen(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-almacenes-cre.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-almacenes-cre.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getAlmacenes();
          this.router.navigate(['inventarios/almacenes']);
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  modificarAlmacen(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-almacenes-mod.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-almacenes-mod.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getAlmacenes();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  

  // TERCEROS
  getTerceros() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/terceros_mysql.php?db='+this.db)
    this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/terceros_mysql.php?db='+this.db)
      .map(
        res => res.json()
      )
      .subscribe( data => {
        setTimeout(() => {
          this.dataTerceros.next(data['records']);
          this.queryLoading(false);
        }, this.simTime);
        
      },
      err => {
        this.snackBar.open('Error de conexión', 'Cerrar',{
          duration: this.snackDuration
        });
        this.queryLoading(false);
      });
  }

  crearTercero(data: JSON,page) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-terceros-cre.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-terceros-cre.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getTerceros();
          if(page == "0")
            this.router.navigate(['inventarios/terceros']);
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  modificarTercero(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-terceros-mod.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-terceros-mod.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getTerceros();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  // DOCUMENTOS
  getDocumentos() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/documentos_mysql.php?db='+this.db)
    this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/documentos_mysql.php?db='+this.db)
      .map(
        res => res.json()
      )
      .subscribe( data => {
        setTimeout(() => {
          this.dataDocumentos.next(data['records']);
          this.queryLoading(false);
        }, this.simTime);
        
      },
      err => {
        this.snackBar.open('Error de conexión', 'Cerrar',{
          duration: this.snackDuration
        });
        this.queryLoading(false);
      });
  }

  crearDocumento(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-documentos-cre.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-documentos-cre.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getDocumentos();
          this.router.navigate(['inventarios/documentos']);
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  modificarDocumento(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-documentos-mod.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-documentos-mod.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getDocumentos();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  actualizarCorrelativo(data: JSON) {
    this.queryLoading(true);
    
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-paquetes-bor.php?db='+this.db, data)
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-documentos-corr.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          /*
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });*/
          this.getDocumentos();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  // GRUPOS
  getGrupos() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/grupos_mysql.php?db='+this.db)
    this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/grupos_mysql.php?db='+this.db)
      .map(
        res => res.json()
      )
      .subscribe( data => {
        setTimeout(() => {
          this.dataGrupos.next(data['records']);
          this.queryLoading(false);
        }, this.simTime);
      },
      err => {
        this.snackBar.open('Error de conexión', 'Cerrar',{
          duration: this.snackDuration
        });
        this.queryLoading(false);
      });
  }

  crearGrupo(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-grupos-cre.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-grupos-cre.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getGrupos();
          this.router.navigate(['inventarios/grupos']);
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  modificarGrupo(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-grupos-mod.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-grupos-mod.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getGrupos();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  // PRODUCTOS
  getProductos() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/productos_mysql.php?db='+this.db)
    this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/productos_mysql.php?db='+this.db)
      .map(
        res => res.json()
      )
      .subscribe( data => {
        setTimeout(() =>  {
          this.dataProductos.next(data['records']);
          this.queryLoading(false);
        }, this.simTime);
        
      },
      err => {
        this.snackBar.open('Error de conexión', 'Cerrar',{
          duration: this.snackDuration
        });
        this.queryLoading(false);
      });
  }

  crearProducto(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-productos-cre.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-productos-cre.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getProductos();
          this.router.navigate(['inventarios/productos']);
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  modificarProducto(data: JSON) {
    this.queryLoading(true);
    
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-productos-mod.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getProductos();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  actualizarStock(data: JSON) {
    this.queryLoading(true);    
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-productos-stock.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
         
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getProductos();
        },
        err => {
          
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  transferirProducto(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-productos-tra.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-productos-tra.php?db='+this.db, JSON.stringify(data))
      
      .subscribe(
        res => {
          let message = res.text();
          this.snackBar.open(message, 'Cerrar',{
            duration:this.snackDuration
          });
          this.getProductos();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }


  //PAQUETE
  getPaquetes() {
    //this.http.get('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/paquetes_mysql.php?db='+this.db)
    this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/paquetes_mysql.php?db='+this.db)
      .map(
        res => res.json()
      )
      .subscribe( data => {
        setTimeout(() =>  {
          this.dataPaquetes.next(data['records']);
          this.queryLoading(false);
        }, this.simTime);
        
      },
      err => {
        this.snackBar.open('Error de conexión', 'Cerrar',{
          duration: this.snackDuration
        });
        this.queryLoading(false);
      });
  }


  crearPaquete(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-paquetes-cre.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-paquetes-cre.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getPaquetes();
          this.router.navigate(['inventarios/productos']);
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  modificarPaquete(data: JSON) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-paquetes-mod.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-paquetes-mod.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getPaquetes();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  borrarPaquete(data: string) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-paquetes-bor.php?db='+this.db, data)
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-paquetes-bor.php?db='+this.db, data)
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.getPaquetes();
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  //REGISTRAR MOVIMIENTO
  registrarMovimiento(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/handler-movimientos-reg.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-movimientos-reg.php?db='+this.db, JSON.stringify(data))
      .subscribe(
        res => {
          this.snackBar.open(res.text(), 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
          this.router.navigate(['inventarios/movimientos']);
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  //CONSULTA DE KARDEX
  consultaKardex(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/kardex_mysql.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/kardex_mysql.php?db='+this.db, JSON.stringify(data))
      .map(
        res => res.json()
      )
      .subscribe(
        res => {
          this.dataKardex.next(res['records']);
          this.queryLoading(false);
          this.consultaKardexSend.next(true);
        },
        err => {
          this.snackBar.open('Error de conexión', 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  //CONSULTA DE STOCK
  consultaStock(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/stock_mysql.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/stock_mysql.php?db='+this.db, JSON.stringify(data))
      .map(
        res => res.json()
      )
      .subscribe(
        res => {
          this.dataStock.next(res['records']);
          this.queryLoading(false);
          this.consultaStockSend.next(true);
        },
        err => {
          this.snackBar.open('Error de conexión:' + err, 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }

  //CONSULTA DE MOVIMIENTO
  consultaReportemov(data: any) {
    this.queryLoading(true);
    //this.http.post('http://localhost/meraki-rent/ms-synergy/src/app/servicios/almacenes/stock_mysql.php?db='+this.db, JSON.stringify(data))
    this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/reportemov_mysql.php?db='+this.db, JSON.stringify(data))
      .map(
        res => res.json()
      )
      .subscribe(
        res => {
          this.dataReportemov.next(res['records']);
          this.queryLoading(false);
          this.consultaReportemovSend.next(true);
          this.moneda.next(res['records'][0]['Moneda']);
          this.snackBar.open('listo!', 'Cerrar',{
            duration: this.snackDuration
          });
        },
        err => {
          this.snackBar.open(err, 'Cerrar',{
            duration: this.snackDuration
          });
          this.queryLoading(false);
        }
      );
  }
  

}
