import { Almacen } from "./../../interfaces/almacenes";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { InventariosService } from "./../../servicios/almacenes/inventarios.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Angular2Csv } from "angular2-csv/Angular2-csv";
import { SpawnSyncOptionsWithStringEncoding } from "child_process";
import { takeWhile } from "rxjs/operators";

@Component({
  selector: "app-stock",
  templateUrl: "./stock.component.html",
  styleUrls: ["./stock.component.css"]
})
export class StockComponent implements OnInit {
  almacenes: any[] = [];

  consulta: boolean = false;
  consultaProducto: boolean = false;
  loading: boolean = false;
  queryDone: boolean = false;

  stock: any[] = [];
  _stock: any[] = [];

  mensajeKardex: string = "Genere una consulta";

  stockForm: FormGroup;

  separador: string = ",";
  separadorDecimal: string = ".";
  filteredOptions: any[];
  productos: any[] = [];
  optionDisplay: number = 1;
  checked: boolean;
  productos_filtrado: any[] = [];
  productName: string = "";
  searchProduct: boolean = false;
  numSeries: any[] = [];
  seriesSelected = new FormControl("");
  productoDisabled: boolean = true;
  productosSeries = [];
  filteredProducts = [];
  filteredSeries = [];
  seriesAutocomplete = [];
  productoFilter: any = new FormControl();
  prodEscogido = "";
  numSerieSelected: string = "";
  private alive: boolean = true;

  constructor(
    private inventariosService: InventariosService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.stockForm = this.fb.group({
      Almacen: ["", Validators.required],
      Serie: [],
      ProductoFiltro: ""
    });

    this.seriesSelected.disable();

    this.inventariosService.currentDataAlmacenes
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.almacenes = res;
        this.almacenes.sort(this.sortBy("Nombre"));
      });

    this.inventariosService.currentLoading
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.loading = res;
        this.cd.markForCheck();
      });

    this.inventariosService.currentConsultaStockSend
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.consulta = res;
        this.cd.markForCheck();
      });

    this.getProducts();
    this.onChanges();
  }

  onChanges(): void {
    this.productoFilter.valueChanges
      .pipe(takeWhile(() => this.alive))
      .subscribe(val => {
        if (val !== "") {
          this.prodEscogido = val;
        } else this.prodEscogido = "";
      });
  }

  getProducts() {
    this.inventariosService.currentDataProductos
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.productos = res;
        this.productos.sort(this.sortBy("Nombre"));
        for (let i = 0; i < this.productos.length; i++) {
          let veces = 0;
          for (let j = 0; j < this.productos.length; j++) {
            if (this.productos[i].Codigo == this.productos[j].Codigo) {
              if (veces == 0) {
                veces++;
              } else {
                this.productos.splice(j, 1);
              }
            }
          }
        }
        this.filteredOptions = this.productos;
      });
  }

  filtrarProductos(alm: string) {
    this.stockForm.get("ProductoFiltro").patchValue("");
    this.seriesSelected.patchValue("");
    this.productName = "";
    this.seriesSelected.disable();
    this.productos.forEach(element => {
      if (element["Zona"] === alm) {
        this.productos_filtrado.push(element);
      }
    });
  }

  sortBy(key) {
    return function(a, b) {
      if (a[key] > b[key]) {
        return 1;
      } else if (a[key] < b[key]) {
        return -1;
      }
      return 0;
    };
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
    this.consultaProducto = false;
    this.inventariosService.consultaStock(this.stockForm.value);

    this.inventariosService.currentDataStock
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.stock = res;
        this._stock = res.slice();
        this.filteredProducts = this._stock;

        this.queryDone = true;

        if (this.stock.length < 1 && this.consulta) {
          this.mensajeKardex = "No se encontraron resultados";
        } else {
          this.mensajeKardex = "Genere una consulta";
        }
      });
    this.cd.markForCheck();
  }

  filtrarStock(ref: any) {
    if (ref != "TODOS") {
      this.filteredProducts = this.stock.filter(
        value => value["Estado"] === ref
      );
    } else {
      this.filteredProducts = this.stock;
    }
  }

  selectedSerie() {
    this.numSerieSelected = this.seriesSelected.value;
    this.seriesAutocomplete = this.filterSerie(this.seriesSelected.value);
  }

  selectProduct(): void {
    let nombre;
    this.numSeries = [];
    this.seriesSelected.patchValue([]);
    this.productName = this.stockForm.get("ProductoFiltro").value;
    this.searchProduct = true;
    if (this.optionDisplay == 2) {
      for (let i = 0; i < this.filteredOptions.length; i++) {
        if (this.productName == this.filteredOptions[i].Codigo) {
          nombre = this.filteredOptions[i].Nombre;
          break;
        }
      }
      if (this.filteredOptions.length != 0) {
        this.inventariosService
          .getNumSerie(nombre)
          .pipe(takeWhile(() => this.alive))
          .subscribe(data => {
            this.numSeries = data.records;
            this.numSeries.sort(this.dynamicSort("numSerie"));
            this.seriesSelected.enable();
          });
      }
    } else {
      if (this.filteredOptions.length != 0) {
        this.inventariosService
          .getNumSerie(this.productName)
          .pipe(takeWhile(() => this.alive))
          .subscribe(data => {
            this.numSeries = data.records;
            this.numSeries.sort(this.dynamicSort("numSerie"));
            this.seriesAutocomplete = this.numSeries;
            this.seriesSelected.enable();
          });
      }
    }
    this.filteredOptions = this.filterProducto(
      this.stockForm.value["ProductoFiltro"]
    );
  }
  pushKeyProducts() {
    this.numSeries = [];
    this.searchProduct = false;
    this.seriesSelected.disable();
    this.filteredOptions = this.filterProducto(
      this.stockForm.value["ProductoFiltro"]
    );
  }

  pushKeySeries() {
    this.numSerieSelected = "";
    this.seriesAutocomplete = this.filterSerie(this.seriesSelected.value);
  }

  filterProducto(val): string[] {
    if (this.optionDisplay == 1) {
      return this.productos.filter(
        option => option.Nombre.toLowerCase().indexOf(val.toLowerCase()) === 0
      );
    } else {
      return this.productos.filter(
        option => option.Codigo.toLowerCase().indexOf(val.toLowerCase()) === 0
      );
    }
  }

  filterSerie(val): string[] {
    return this.numSeries.filter(
      option => option.numSerie.toLowerCase().indexOf(val.toLowerCase()) === 0
    );
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

  exportData() {
    let options = {
      fieldSeparator: this.separador,
      quoteStrings: '"',
      decimalseparator: this.separadorDecimal,
      showLabels: false,
      showTitle: false,
      useBom: false
    };

    let exportStock = this.filteredProducts.slice();
    exportStock.unshift({
      Nombre: "PRODUCTO",
      Unidad: "UNIDAD",
      Stock_actual: "STOCK",
      Estado: "ESTADO"
    });
    new Angular2Csv(exportStock, "Stock", options);
  }

  configExportDec(dec: string) {
    this.separadorDecimal = dec;
  }

  configExportSep(sep: string) {
    this.separador = sep;
  }

  getProductoSerie() {
    this.loading = true;
    let filtro;
    this.consulta = false;
    if (this.optionDisplay != 2) {
      filtro = {
        Producto: this.productName,
        Series: []
      };
    } else {
      for (let i = 0; i < this.filteredOptions.length; i++) {
        if (this.filteredOptions[i].Codigo == this.productName) {
          filtro = {
            Producto: this.filteredOptions[i].Nombre,
            Series: []
          };
          break;
        }
      }
    }
    if (this.numSerieSelected != "") {
      filtro.Series.push(this.numSerieSelected);
    }
    this.inventariosService
      .getProductoSerie(filtro)
      .pipe(takeWhile(() => this.alive))
      .subscribe(data => {
        for (let i = 0; i < data.records.length; i++) {
          if (data.records[i].estado != 2) {
            data.records[i].estado = "En almacen";
          } else data.records[i].estado = "Vendido";
        }
        this.productosSeries = data.records;
        this.filteredSeries = this.productosSeries;
        this.consultaProducto = true;
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  filterData() {
    if (this.consulta == true) {
      this.filteredProducts = this._stock.filter(
        value =>
          value["Nombre"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["Unidad"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["Stock_actual"]
            .toString()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["Estado"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase())
      );
    }
    if (this.consultaProducto == true) {
      this.filteredSeries = this.productosSeries.filter(
        value =>
          value["almacen"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["documento"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["estado"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["fecha"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["movimiento"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["numSerie"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["operacion"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["usuario"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase()) ||
          value["tercero"]
            .toLowerCase()
            .startsWith(this.productoFilter.value.toLowerCase())
      );
    }
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
