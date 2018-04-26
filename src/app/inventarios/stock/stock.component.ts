import { Almacen } from './../../interfaces/almacenes';
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
  filteredOptions: any[];
  productos: any[] = [];
  optionDisplay: number = 1;
  checked: boolean;
  productos_filtrado: any[] = [];
  productName: string = null;
  numSeries: any[] = [];
  seriesSelected = new FormControl([]);
  productoDisabled : boolean = true;

  constructor(private inventariosService: InventariosService,
              private fb: FormBuilder) { }

  ngOnInit() {

    this.stockForm = this.fb.group({
      Almacen: ['', Validators.required],
      Producto : ['', Validators.required,],
      Serie : ['', Validators.required],
      ProductoFiltro : [ '' ]
    });

    this.stockForm.get("ProductoFiltro").disable();

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

    this.getProducts();

  }

  getProducts() {
    this.inventariosService.currentDataProductos.subscribe(res => {
      this.productos = res;
      this.productos.sort(this.sortBy("Nombre"));
    });
  }

  filtrarProductos(alm: string) {
    this.stockForm.get("ProductoFiltro").enable();
    this.productos_filtrado = [];
    this.productos.forEach(element => {
      if (element["Zona"] === alm) {
        this.productos_filtrado.push(element);
      }
    });

    this.filteredOptions = this.productos_filtrado;
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

  slideToogleChange(e) {
    if (e.checked) {
      this.optionDisplay = 2;
      this.checked = true;
      this.stockForm.patchValue({ ProductoFiltro: "" });
      this.pushKeyProducts();
      this.numSeries = [];
    } else {
      this.optionDisplay = 1;
      this.checked = false;
      this.stockForm.patchValue({ ProductoFiltro: "" });
      this.pushKeyProducts();
      this.numSeries = [];
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

  selectProduct(): void {
    let nombre;
    if (this.productName != this.stockForm.get("ProductoFiltro").value) {
      this.numSeries = [];
      this.seriesSelected.patchValue([]);
      this.productName = this.stockForm.get("ProductoFiltro").value;
      this.pushKeyProducts();
      if(this.optionDisplay == 2){
        for (let i = 0; i < this.filteredOptions.length; i++) {
          if(this.productName == this.filteredOptions[i].Codigo){
            nombre = this.filteredOptions[i].Nombre;
            break;
          }
        }
        this.inventariosService.getNumSerie(nombre).subscribe(data => {
          this.numSeries = data.records;
          this.numSeries.sort(this.dynamicSort("numSerie"));
        });
      }
      else{
      this.inventariosService.getNumSerie(this.productName).subscribe(data => {
        this.numSeries = data.records;
        this.numSeries.sort(this.dynamicSort("numSerie"));
      });
    }
    }
  }

  //[disabled]="stockForm.value.Almacen == ''"
  //[disabled]="stockForm.value.Producto == ''"
  pushKeyProducts() {
    this.numSeries = [];
    this.filteredOptions = this.filterProducto(
      this.stockForm.value["ProductoFiltro"]
    );
  }

  filterProducto(val): string[] {
    if (this.optionDisplay == 1) {
      return this.productos_filtrado.filter(
        option => option.Nombre.toLowerCase().indexOf(val.toLowerCase()) === 0
      );
    } else {
      return this.productos_filtrado.filter(
        option => option.Codigo.toLowerCase().indexOf(val.toLowerCase()) === 0
      );
    }
  }

  dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function(a, b) {
      var result =
        parseInt(a[property]) < parseInt(b[property])
          ? -1
          : parseInt(a[property]) > parseInt(b[property])
            ? 1
            : 0;
      return result * sortOrder;
    };
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
