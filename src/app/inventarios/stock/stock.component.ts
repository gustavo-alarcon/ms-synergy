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

@Component({
  selector: "app-stock",
  templateUrl: "./stock.component.html",
  styleUrls: ["./stock.component.css"]
})
export class StockComponent implements OnInit {
  almacenes: any[] = [];

  consulta: boolean = false;
  consultaProducto : boolean = false;
  loading: boolean = false;
  queryDone: boolean = false;
  canSearchProduct : boolean = true;

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
  productName: string = null;
  numSeries: any[] = [];
  seriesSelected = new FormControl([]);
  productoDisabled: boolean = true;
  productosSeries = [];

  constructor(
    private inventariosService: InventariosService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.stockForm = this.fb.group({
      Almacen: ["", Validators.required],
      Serie: [[]],
      ProductoFiltro: [""]
    });

    this.stockForm.get("ProductoFiltro").disable();
    this.seriesSelected.disable();

    this.inventariosService.currentDataAlmacenes.subscribe(res => {
      this.almacenes = res;
      this.almacenes.sort(this.sortBy("Nombre"));
    });

    this.inventariosService.currentLoading.subscribe(res => {
      this.loading = res;
      this.cd.detectChanges();
    });

    this.inventariosService.currentConsultaStockSend.subscribe(res => {
      this.consulta = res;
      this.cd.detectChanges();
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
    this.stockForm.controls["ProductoFiltro"].enable();
    this.productos_filtrado = [];
    this.productos.forEach(element => {
      if (element["Zona"] === alm) {
        this.productos_filtrado.push(element);
      }
    });

    this.filteredOptions = this.productos_filtrado;
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

    this.inventariosService.currentDataStock.subscribe(res => {
      this.stock = res;
      this._stock = res.slice();

      this.queryDone = true;

      if (this.stock.length < 1 && this.consulta) {
        this.mensajeKardex = "No se encontraron resultados";
      } else {
        this.mensajeKardex = "Genere una consulta";
      }
    });
    this.cd.detectChanges();
  }

  filtrarStock(ref: any) {
    if (ref != "TODOS") {
      this._stock = this.stock.filter(value => value["Estado"] === ref);
    }
  }

  selectProduct(): void {
    let nombre;
    this.numSeries = [];
    this.seriesSelected.patchValue([]);
    this.productName = this.stockForm.get("ProductoFiltro").value;
    this.pushKeyProducts();
    if (this.optionDisplay == 2) {
      for (let i = 0; i < this.filteredOptions.length; i++) {
        if (this.productName == this.filteredOptions[i].Codigo) {
          nombre = this.filteredOptions[i].Nombre;
          break;
        }
      }
      if (this.filteredOptions.length != 0) {
        this.inventariosService.getNumSerie(nombre).subscribe(data => {
          this.numSeries = data.records;
          this.numSeries.sort(this.dynamicSort("numSerie"));
          this.canSearchProduct = false;
          this.seriesSelected.enable();
        });
      }
    } else {
      if (this.filteredOptions.length != 0) {
        this.inventariosService
          .getNumSerie(this.productName)
          .subscribe(data => {
            this.numSeries = data.records;
            this.numSeries.sort(this.dynamicSort("numSerie"));
            this.canSearchProduct = false;
            this.seriesSelected.enable();
          });
      }
    }
  }
  pushKeyProducts() {
    this.numSeries = [];
    this.seriesSelected.disable();
    this.canSearchProduct = true;
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

  exportData() {
    let options = {
      fieldSeparator: this.separador,
      quoteStrings: '"',
      decimalseparator: this.separadorDecimal,
      showLabels: false,
      showTitle: false,
      useBom: false
    };

    let exportStock = this._stock.slice();
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
        }
      }
    }
    if (this.seriesSelected.value.length > 0) {
      filtro.Series = this.seriesSelected.value;
    }
    this.inventariosService.getProductoSerie(filtro).subscribe(data => {
      this.productosSeries = data.records;
      this.consultaProducto = true;
      this.cd.detectChanges();
    });
  }
}
