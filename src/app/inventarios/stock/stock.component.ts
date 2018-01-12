import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { InventariosService } from './../../servicios/almacenes/inventarios.service';
import { Component, OnInit } from '@angular/core';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  almacenes: any[] = [];

  consulta: boolean = false;
  loading: boolean = false;
  queryDone: boolean = false;

  stock: any[] = [];
  _stock: any[] = [];

  mensajeKardex: string = 'Genere una consulta';

  stockForm: FormGroup;

  separador: string = ",";
  separadorDecimal: string = ".";

  constructor(private inventariosService: InventariosService,
              private fb: FormBuilder) { }

  ngOnInit() {

    this.stockForm = this.fb.group({
      Almacen: ['', Validators.required]
    });

    this.inventariosService.currentDataAlmacenes.subscribe(res => {
      this.almacenes = res;
      this.almacenes.sort(this.sortBy('Nombre'));
    });

    this.inventariosService.currentLoading.subscribe(res => {
      this.loading = res;
    });

    this.inventariosService.currentConsultaStockSend.subscribe(res => {
      this.consulta = res;
    });

  }

  sortBy(key) {
    return function(a , b) {
      if (a[key] > b[key]){
        return 1;
      }else if ( a[key] < b[key]){
        return -1;
      }
      return 0;
    }
  }

  onSubmit() {

    this.consulta = false;

    this.inventariosService.consultaStock(this.stockForm.value);

    this.inventariosService.currentDataStock.subscribe(res => {
      this.stock = res;
      this._stock = res.slice();
      
      this.queryDone = true;

      if (this.stock.length < 1 && this.consulta) {
        this.mensajeKardex = 'No se encontraron resultados';
      } else {
        this.mensajeKardex = 'Genere una consulta';
      }
    });
  }

  filtrarStock(ref: any){
    if(ref != 'TODOS'){
      this._stock = this.stock.filter( value => value['Estado'] === ref);
    }
    
  }

  exportData(){

    let options = { 
      fieldSeparator: this.separador,
      quoteStrings: '"',
      decimalseparator: this.separadorDecimal,
      showLabels: false, 
      showTitle: false,
      useBom: false
    };

    let exportStock = this._stock.slice();
    exportStock.unshift({Nombre:"PRODUCTO",Unidad:"UNIDAD",Stock_actual:"STOCK",Estado:"ESTADO"});
    new Angular2Csv(exportStock, 'Stock', options);
  }

  configExportDec(dec: string){
    this.separadorDecimal = dec;
  }

  configExportSep(sep: string){
    this.separador = sep;
  }

}
