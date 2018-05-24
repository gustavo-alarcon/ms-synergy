import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseType } from '@angular/http';

@Injectable()
export class PosService {

  constructor(private http : HttpClient) { }

  getWarehouse(db): Observable<any>{
    return this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/ZS_mysql.php?db='+JSON.parse(db));
  }

  getProducts(db): Observable<any>{
    return this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/productos_mysql.php?db='+JSON.parse(db));
  }

  getPackages(db): Observable<any>{
    return this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/paquetes_mysql.php?db='+JSON.parse(db));
  }

  getDocuments(db): Observable<any> {
    return this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/documentos_mysql.php?db='+JSON.parse(db));
  }

  actualizarStock(db, data) : Observable<any>{   
    return this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-productos-stock.php?db='+JSON.parse(db), JSON.stringify(data), {responseType : 'text'});
  }

  getSalesHistory(db): Observable<any>{
    return this.http.get('http://www.meraki-s.com/rent/ms-synergy/php/handler-pos-historial.php?db='+JSON.parse(db));
  }

  regMovimiento(db, data):Observable<any>{
    return this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/test/handler-pos-venta.php?db='+JSON.parse(db), JSON.stringify(data), { responseType : 'text' });
  }

  updateCorrelativo(db,data): Observable<any>{
    return this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-documentos-corr.php?db='+JSON.parse(db), JSON.stringify(data));
  }

  getSalesData(db,operacion) : Observable<any>{
    return this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/handler-pos-detalles.php?db='+JSON.parse(db), JSON.stringify(operacion));
  }

  removeSale(db, data) : Observable<any>{
    return this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/test/handler-pos-anular.php?db='+JSON.parse(db), JSON.stringify(data), { responseType : 'text' });
  }

  getNumSerie(db, tn): Observable<any> {
    return this.http.get(
      "http://www.meraki-s.com/rent/ms-synergy/php/test/handler-getNumSeriexProduct.php?db=" +
        JSON.parse(db) +
        "&tn=" +
        tn
    );
  }

  getSalesNumSeries(db, Operacion, Producto): Observable<any>{
    let data = {
      Operacion,
      Producto
    }
    return this.http.post('http://www.meraki-s.com/rent/ms-synergy/php/test/handler-numSeries-sale.php?db='+JSON.parse(db), JSON.stringify(data)  );
  }
}
