import { LoginService } from './../../servicios/login/login.service';
import { element } from 'protractor';
import { InventariosService } from './../../servicios/almacenes/inventarios.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';
import { MatSnackBar } from '@angular/material';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { log } from 'util';
import { filter } from 'rxjs/operators/filter';


const COMMA = 188;

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css']
})
export class MovimientosComponent implements OnInit {

  /*CHIPS*/
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;

  separatorKeysCodes = [ENTER, COMMA];

  guias: any[] = [];
  guias_string: string = '';

  movimientoForm: FormGroup;

  now: any;
  timeLimit: any;
  uname: string = '';
  tipoMovimiento: string = 'Tercero';
  precioPlaceholder: string = 'Precio';
  precioCalculado: number = 0;
  precioActual: number = 0;
  idProductoActual: string = '';
  loading: boolean;
  packFlag: boolean = false;

  tempStocks: any[] = [];
  listaResumen: any[] = [];
  documentos: any[] = [];
  numerosSerie: any[] [];
  docList: any[] = [];
  docListName: string = '';
  docListSerie: string = '';
  docListCorrelativo: string = '';
  productos: any[] = [];
  productos_filtrado: any[] = [];
  terceros: any[] = [];
  terceros_filtrado: any[] = [];
  almacenes: any[] = [];
  paquetes: any[] = [];
  paquetes_filtrado: any[] = [];
  lista_items_paquete: any[] = [];
  pack_nombre: any[] = [];

  montoTotal: number = 0;

  stockData: any = {
    ID: '',
    Cantidad: 0
  };

  documentoData: any = {
    ID: '',
    Correlativo: 0
  }

  perms: any = [];

  constructor(private inventariosService: InventariosService,
              private loginService: LoginService,
              private fb: FormBuilder,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
  
    this.loginService.currentUserInfo.subscribe(res => {
      this.uname = res[0]['Uname'];
    });

    this.movimientoForm = this.fb.group({
      Documento: ['', Validators.required],
      Serie: ['', Validators.required],
      SerieCompra: ['', Validators.required],
      Correlativo: [{value: '', disabled: true}, Validators.required],
      Guia: '',
      Fecha: ['', Validators.required],
      Tercero: ['', Validators.required],
      AlmacenOrigen: ['', Validators.required],
      AlmacenDestino: [''],
      Producto: '',
      Paquete: '',
      Cantidad: ['', Validators.required],
      Precio: [{value: '', disabled: false}, Validators.required],
      Usuario: ''
    });

    this.loginService.currentPermissions.subscribe(res => {
      this.perms = res;

    });

    this.currentDate();
    this.movimientoForm.patchValue({Fecha: this.now});

    this.inventariosService.currentLoading.subscribe(res => {
      this.loading = res;
    });

    this.inventariosService.currentDataDocumentos.subscribe(res => {
      this.documentos = res;

      if(!this.perms[0]['reg_doc_entrada']){
        this.documentos = this.documentos.filter( value => value['Naturaleza'] != 'ENTRADA');
      }

      if(!this.perms[0]['reg_doc_salida']){
        this.documentos = this.documentos.filter( value => value['Naturaleza'] != 'SALIDA');
      }

      if(!this.perms[0]['reg_doc_transferencia']){
        this.documentos = this.documentos.filter( value => value['Naturaleza'] != 'TRANSFERENCIA');
      }

      if(!this.perms[0]['reg_doc_ajusteEntrada']){
        this.documentos = this.documentos.filter( value => value['Naturaleza'] != 'AJUSTE DE ENTRADA');
      }

      if(!this.perms[0]['reg_doc_ajusteSalida']){
        this.documentos = this.documentos.filter( value => value['Naturaleza'] != 'AJUSTE DE SALIDA');
      }

      this.documentos.sort(this.sortBy('Nombre'));
      

      let _serie = '';
      this.numerosSerie = [];
      this.documentos.forEach(element => {
        if (element['Numtienda'] != _serie && this.numerosSerie.indexOf(element['Numtienda']) < 0) {
          this.numerosSerie.push(element['Numtienda']);
          _serie = element['Numtienda'];
        }
      });
    });

    this.inventariosService.currentDataProductos.subscribe(res => {
      this.productos = res;
      this.productos.sort(this.sortBy('Nombre'));
    });

    this.inventariosService.currentDataAlmacenes.subscribe(res => {
      this.almacenes = res;
      this.almacenes.sort(this.sortBy('Nombre'));
    });

    this.inventariosService.currentDataTerceros.subscribe(res => {
      this.terceros = res;
      this.terceros.sort(this.sortBy('Nombre'));
    });

    this.inventariosService.currentDataPaquetes.subscribe(res => {
      this.paquetes = res;

    });
    
  }

  currentDate() {
    const currentDate = new Date();
    
    if(31 < 31){
      if(31 + 1 < 10){
        if(currentDate.getMonth()+1 < 10){
          var limite = currentDate.getFullYear()+'-0'+(currentDate.getMonth()+1)+'-0'+((31+1)%31);
        }else{
          var limite = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-0'+((31+1)%31);
        }
      }else{
        if(currentDate.getMonth()+1 < 10){
          var limite = currentDate.getFullYear()+'-0'+(currentDate.getMonth()+1)+'-'+((31+1)%31);
        }else{
          var limite = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+((31+1)%31);
        }
      }
    }else{
      if(currentDate.getMonth()+1 < 12){
        if((currentDate.getMonth()+2)%13 + 1 < 10){
          var limite = currentDate.getFullYear()+'-0'+(((currentDate.getMonth()+2)%13)+1)+'-0'+(1);
        }else{
          var limite = currentDate.getFullYear()+'-'+(((currentDate.getMonth()+2)%13)+1)+'-0'+(1);
        }
      }else{
        if((currentDate.getMonth()+2)%13 + 1 < 10){
          var limite = (currentDate.getFullYear()+1) +'-0'+(((currentDate.getMonth()+2)%13)+1)+'-0'+(1);
        }else{
          var limite = (currentDate.getFullYear()+1) +'-'+(((currentDate.getMonth()+2)%13)+1)+'-0'+(1);
        }
      }
      
    }

    console.log(limite);
    this.now = currentDate;
    this.timeLimit = limite;
  }

  sortBy(key) {
    return function(a , b) {
      if (a[key] > b[key]){
        return 1;
      }else if ( a[key] < b[key]){
        return -1;
      }[]
      return 0;
    }
  }

  addDoc(doc: any, corr: any) {

    this.currentDate();
    this.movimientoForm.patchValue({Fecha: this.now});
    
    if((doc != undefined || doc != '') && (this.movimientoForm.value['Serie'] != '' || this.movimientoForm.value['SerieCompra'] != '') && this.movimientoForm.getRawValue()['Correlativo'] != ''){
      let _exist = false;
      
      this.docList.forEach(element => {
        if(doc['Nombre'] === element['Nombre'] && (this.movimientoForm.value['Serie'] === element['Serie'] || this.movimientoForm.value['SerieCompra'] === element['Serie']) && doc['Correlativo_actual'] === element['Correlativo']){
          _exist = true;
        }
      });
      if(!_exist){
        
        this.docList.push({Nombre:doc['Nombre'], Serie: this.tipoMovimiento === 'ENTRADA'? this.movimientoForm.value['SerieCompra']:this.movimientoForm.value['Serie'], Correlativo:this.movimientoForm.getRawValue()['Correlativo']});
        this.documentoData['ID'] = doc['ID'];
        this.documentoData['Correlativo'] = this.movimientoForm.getRawValue()['Correlativo'];
      }else{
        this.snackBar.open('Documento repetido', 'Cerrar',{
          duration: 6000,
        });
      }
    }else{
      this.snackBar.open('Completar la información del documento', 'Cerrar',{
        duration: 6000,
      });
    }
  }

  removeDoc(idx: number) {

    if (this.docList.length > 1) {
      this.docList.splice(idx,1);
    }else if(idx === 0){
      this.docList = [];
    }
    
  }

  filtrarTerceros(tipo: string, nat: string, corr: any){
    
    if (this.docList.length < 1) {
      if (nat === 'ENTRADA') {
        this.tipoMovimiento = nat;
        this.precioPlaceholder = 'Precio de Compra';
        this.movimientoForm.controls['Precio'].enable();
        this.movimientoForm.controls['Correlativo'].enable();
        this.movimientoForm.patchValue({Serie:0, SerieCompra:''});
        this.movimientoForm.controls['SerieCompra'].setErrors(null);
      } else if (nat === 'SALIDA') {
        this.tipoMovimiento = nat;
        this.precioPlaceholder = 'Precio de Venta';
        this.movimientoForm.controls['Precio'].enable();
        this.movimientoForm.controls['Correlativo'].disable();
        this.movimientoForm.patchValue({Serie:'', SerieCompra:0});
        this.movimientoForm.controls['Serie'].setErrors(null);
      } else if (nat === 'TRANSFERENCIA') {
        this.tipoMovimiento = nat;
        this.precioPlaceholder = 'Transferencia de material';
        this.movimientoForm.controls['Precio'].disable();
        this.movimientoForm.patchValue({Serie:'', SerieCompra:0});
        this.movimientoForm.controls['Serie'].setErrors(null);
      } else if (nat === 'AJUSTE DE ENTRADA') {
        this.tipoMovimiento = nat;
        this.precioPlaceholder = 'Ajuste de entrada';
        this.movimientoForm.controls['Precio'].disable();
        this.movimientoForm.patchValue({Serie:'', SerieCompra:0});
        this.movimientoForm.controls['Serie'].setErrors(null);
      } else if (nat === 'AJUSTE DE SALIDA') {
        this.tipoMovimiento = nat;
        this.precioPlaceholder = 'Ajuste de salida';
        this.movimientoForm.controls['Precio'].disable();
        this.movimientoForm.patchValue({Serie:'', SerieCompra:0});
        this.movimientoForm.controls['Serie'].setErrors(null);
      } else {
        this.precioPlaceholder = 'Precio';
      }
      
      this.terceros_filtrado = [];
  
      this.terceros.forEach(element => {
        if(element['TerceroClass'] === tipo){
          this.terceros_filtrado.push(element);
        }
      });

    }else{
      
      if (nat === 'ENTRADA') {
        this.movimientoForm.controls['Correlativo'].enable();
        this.movimientoForm.patchValue({Serie:0, SerieCompra:''});
        this.movimientoForm.controls['SerieCompra'].setErrors(null);
      } else if (nat === 'SALIDA') {
        this.movimientoForm.controls['Correlativo'].disable();
        this.movimientoForm.patchValue({Serie:'', SerieCompra:0});
        this.movimientoForm.controls['Serie'].setErrors(null);
      } else if (nat === 'TRANSFERENCIA') {
        this.movimientoForm.patchValue({Serie:'', SerieCompra:0});
        this.movimientoForm.controls['Serie'].setErrors(null);
      } else if (nat === 'AJUSTE DE ENTRADA') {
        this.movimientoForm.patchValue({Serie:'', SerieCompra:0});
        this.movimientoForm.controls['Serie'].setErrors(null);
      } else if (nat === 'AJUSTE DE SALIDA') {
        this.movimientoForm.patchValue({Serie:'', SerieCompra:0});
        this.movimientoForm.controls['Serie'].setErrors(null);
      }
    }
    
    this.movimientoForm.patchValue({Correlativo: this.tipoMovimiento === 'ENTRADA'? '':corr});
    this.movimientoForm.controls['Correlativo'].setErrors(null);
    
  }

  filtrarProductos(alm: string){
    
    this.productos_filtrado = [];

    this.productos.forEach(element => {
      if(element['Zona'] === alm){
        this.productos_filtrado.push(element);
      }
    });

    this.paquetes.forEach(element => {
      if(element['Almacen'] === alm){
        this.paquetes_filtrado.push(element);
      }
    });

    let _nombre = '';
    this.pack_nombre = [];
    this.paquetes_filtrado.forEach(element => {
      if(element['Paquete'] != _nombre){
        this.pack_nombre.push(element['Paquete']);
        _nombre = element['Paquete'];
      }
    });
    
  }

  prodActual(prod: any) {
    
    this.precioActual = 0;
    if (this.tipoMovimiento === 'TRANSFERENCIA' || this.tipoMovimiento === 'AJUSTE DE ENTRADA' || this.tipoMovimiento === 'AJUSTE DE SALIDA') {
      this.movimientoForm.controls['Precio'].disable();
    }else{
      this.movimientoForm.controls['Precio'].enable();
    }
    
    this.movimientoForm.patchValue({Precio:0});
    this.movimientoForm.patchValue({Paquete: ''});
    this.movimientoForm.patchValue({Compra: this.precioActual});
    this.movimientoForm.patchValue({Cantidad: null});
    this.packFlag = false;

    if (this.tipoMovimiento === 'ENTRADA') {
      this.precioActual = parseFloat(prod['Compra']);
    }else if (this.tipoMovimiento === 'SALIDA') {
      this.precioActual = parseFloat(prod['Venta']);
    }

    this.tempStocks.push({Producto:prod['Nombre'], Stock:prod['Stock_actual']});
    this.idProductoActual = prod['ID'];

  }

  packActual(pack: any) {
    this.precioActual = 0;
    this.movimientoForm.controls['Precio'].disable();
    this.movimientoForm.patchValue({Precio:0});
    this.lista_items_paquete = [];
    this.movimientoForm.patchValue({Paquete: pack});
    this.movimientoForm.patchValue({Producto: ''});
    this.movimientoForm.patchValue({Cantidad: null});
    this.packFlag = true;

    this.paquetes.forEach(element => {
      if (element['Paquete'] === pack) {
        if (this.tipoMovimiento === 'ENTRADA') {
          this.precioActual = this.precioActual + parseFloat(element['Compra']) * parseFloat(element['Cantidad']);
        }else if (this.tipoMovimiento === 'SALIDA') {
          this.precioActual = this.precioActual + parseFloat(element['PrecioUnitario']) * parseFloat(element['Cantidad']);
        }

        this.lista_items_paquete.push({
          Producto: element['Nombre'],
          Cantidad: element['Cantidad'],
          Compra: element['Compra'],
          Venta: element['Venta'],
          Unidad: element['Unidad'],
          Moneda: element['Moneda'],
          PrecioUnitario: element['PrecioUnitario']
        });

        this.tempStocks.push({Producto:element['Nombre'], Stock:element['Stock_actual']});
      }
    });
    
  }

  precio(cantidad: number) {
    this.movimientoForm.patchValue({Precio:cantidad * this.precioActual});
    if (this.tipoMovimiento === 'TRANSFERENCIA' || this.tipoMovimiento === 'AJUSTE DE ENTRADA' || this.tipoMovimiento === 'AJUSTE DE SALIDA') {
      this.movimientoForm.patchValue({Precio:0})
    }
  }

  onSubmit() {
    this.agregar();
  }

  agregar() {
    
    if(this.docList.length === 0){
      this.snackBar.open('Agregue por lo menos un documento', 'Cerrar',{
        duration: 6000,
      });
      return;
    }

    this.docListName = '';
    this.docListSerie = '';
    this.docListCorrelativo = '';

    this.docList.forEach(element => {

      if (this.docListName.length === 0) {
        this.docListName += element['Nombre'];
        this.docListSerie += element['Serie'];
        this.docListCorrelativo += element['Correlativo'];
      }else{
        this.docListName += ',';
        this.docListName += element['Nombre'];
        this.docListSerie += ',';
        this.docListSerie += element['Serie'];
        this.docListCorrelativo += ',';
        this.docListCorrelativo += element['Correlativo'];
      }

    });

    if (this.packFlag) {
      
      this.paquetes.forEach(element => {

        if (this.movimientoForm.value['Paquete'] === element['Paquete']) {
          this.listaResumen.push(
            { 
              Fecha: this.movimientoForm.value['Fecha'],
              Documento: this.docListName,
              Serie: this.docListSerie,
              Correlativo: this.docListCorrelativo,
              Tercero: this.movimientoForm.value['Tercero'],
              AlmacenOrigen: this.movimientoForm.value['AlmacenOrigen'],
              AlmacenDestino: this.movimientoForm.value['AlmacenDestino'],
              IDProducto: element['IDProducto'],
              Producto: element['Nombre'],
              Paquete: element['Paquete'],
              Unidad: element['Unidad'],
              Moneda: element['Moneda'],
              Cantidad: parseFloat(element['Cantidad']) * parseFloat(this.movimientoForm.value['Cantidad']),
              Compra: element['Compra'],
              Venta: element['PrecioUnitario'],
              Movimiento: this.tipoMovimiento,
              Usuario: this.uname
              
            }
          );
          
        }
      });
    } else if (!this.packFlag) {
      this.listaResumen.push(
        { 
          Fecha: this.movimientoForm.value['Fecha'],
          Documento: this.docListName,
          Serie: this.docListSerie,
          Correlativo: this.docListCorrelativo,
          Tercero: this.movimientoForm.value['Tercero'],
          AlmacenOrigen: this.movimientoForm.value['AlmacenOrigen'],
          AlmacenDestino: this.movimientoForm.value['AlmacenDestino'],
          IDProducto: this.idProductoActual,
          Producto: this.movimientoForm.value['Producto']['Nombre'],
          Paquete: this.movimientoForm.value['Paquete'],
          Unidad: this.movimientoForm.value['Producto']['Unidad'],
          Moneda: this.movimientoForm.value['Producto']['Moneda'],
          Cantidad: parseFloat(this.movimientoForm.value['Cantidad']),
          Compra: this.tipoMovimiento === 'ENTRADA' ? this.movimientoForm.value['Precio']/parseFloat(this.movimientoForm.value['Cantidad']):0,
          Venta: this.tipoMovimiento === 'SALIDA' ? this.movimientoForm.value['Precio']/parseFloat(this.movimientoForm.value['Cantidad']):0,
          Movimiento: this.tipoMovimiento,
          Usuario: this.uname
        }
      );

    }

    this.calcMontoTotal();
  }

  calcMontoTotal(){
    this.montoTotal = 0.00;
    this.listaResumen.forEach(element => {
      this.montoTotal = this.montoTotal + (element.Movimiento === 'ENTRADA'? element.Compra * element.Cantidad: element.Venta * element.Cantidad);
    });
  }

  regMovimiento() {

    let _resumen = [];
    let _item = [];
    this.listaResumen.forEach(element => {

      let _idx = _item.indexOf(element['Producto']);

      if( _idx > -1) {
        
        _resumen[_idx]['Cantidad'] += parseFloat(element['Cantidad']);
        
      }else{
        _resumen.push({ID:element['IDProducto'], Producto:element['Producto'], Cantidad: parseFloat(element['Cantidad']), Origen:element['AlmacenOrigen'], Destino: element['AlmacenDestino']});
        _item.push(element['Producto']);
      }

    });
    
    let registrar = true;
    _resumen.forEach(element => {
      this.tempStocks.forEach(_element => {
        if(element['Producto'] === _element['Producto']) {
          if(element['Cantidad'] > _element['Stock'] && this.listaResumen[0]['Movimiento'] === 'SALIDA') {
            let message = 'Oops : '+ element['Producto'];
            this.snackBar.open(message, 'Stock Superado',{
              duration: 4000,
            });
            registrar = false;
            return;
          }
        }
      });
    });

    if(this.docList.length < 1){
      this.snackBar.open('Debe agregar por lo menos un documento', 'Cerrar',{
        duration: 6000,
      });
      registrar = false;
    }

    if(this.listaResumen.length < 1){
      this.snackBar.open('No hay productos/paquetes en la lista de resumen', 'Cerrar',{
        duration: 6000,
      });
      registrar = false;
    }

    if (registrar) {
      

      for (var i = 0; i < _resumen.length; i++) {
        for (var j = 0; j < this.productos.length; j++) {
          if (_resumen[i]['ID'] === this.productos[j]['ID']) {
            if (this.listaResumen[0]['Movimiento'] === 'SALIDA' || this.listaResumen[0]['Movimiento'] === 'AJUSTE DE SALIDA') {
              //this.productos[j]['Stock_actual'] = parseInt(this.productos[j]['Stock_actual']) - parseInt(_resumen[i]['Cantidad']);
              //console.log('Cantidad enviada',this.productos[j]['Stock_actual']);
              //this.inventariosService.modificarProducto(this.productos[j]);
              this.stockData['ID'] = this.productos[j]['ID'];
              this.stockData['Cantidad'] = parseFloat(_resumen[i]['Cantidad'])*-1;
              this.inventariosService.actualizarStock(this.stockData);
            }else if (this.listaResumen[0]['Movimiento'] === 'ENTRADA' || this.listaResumen[0]['Movimiento'] === 'AJUSTE DE ENTRADA') {
              //this.productos[j]['Stock_actual'] = parseInt(this.productos[j]['Stock_actual']) + parseInt(_resumen[i]['Cantidad']);
              //console.log('Cantidad enviada',this.productos[j]['Stock_actual']);
              //this.inventariosService.modificarProducto(this.productos[j]);
              this.stockData['ID'] = this.productos[j]['ID'];
              this.stockData['Cantidad'] = parseFloat(_resumen[i]['Cantidad']);
              this.inventariosService.actualizarStock(this.stockData);
            }else if (this.listaResumen[0]['Movimiento'] === 'TRANSFERENCIA') {
              if (this.productos[j]['Stock_actual'] >= parseFloat(_resumen[i]['Cantidad'])) {
                this.inventariosService.transferirProducto(_resumen[i]);
              }else{
                this.snackBar.open('No se puede transferir esta cantidad', 'Cerrar',{
                  duration: 4000,
                });
              }
            }
          }
        }
      }

      let message = 'Guardando movimiento ...';
      this.snackBar.open(message, 'Genial!',{
        duration: 4000,
      });
      
      this.inventariosService.registrarMovimiento(this.listaResumen);
      this.inventariosService.actualizarCorrelativo(this.documentoData);
      this.limpiarLista();
      this.docList = [];
      this.docListName = '';
      this.docListSerie = '';
      this.docListCorrelativo = '';
      this.movimientoForm.patchValue({
        Documento: '',
        Serie:'',
        Correlativo: ''
      });
      this.movimientoForm.controls['Serie'].setErrors(null);
      this.movimientoForm.controls['Documento'].setErrors(null);
    }
  }

  limpiarLista() {
    this.listaResumen = [];
    this.calcMontoTotal();
  }

  sumarCantidad( idx: number) {
    this.listaResumen[idx]['Cantidad'] += 1;
    this.calcMontoTotal();
  }

  restarCantidad( idx: number ) {
    if (this.listaResumen[idx]['Cantidad'] > 0) {
      this.listaResumen[idx]['Cantidad'] -= 1;
      this.calcMontoTotal();
    }
  }

  borrarItem( idx: number ) {
    this.listaResumen.splice(idx,1);
    this.calcMontoTotal();
  }
}
