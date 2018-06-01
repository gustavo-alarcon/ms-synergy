import { MatSnackBar } from "@angular/material";
import { InventariosService } from "./../../../servicios/almacenes/inventarios.service";
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { takeWhile } from "rxjs/operators";

@Component({
  selector: "app-crear-producto",
  templateUrl: "./crear-producto.component.html",
  styleUrls: ["./crear-producto.component.css"]
})
export class CrearProductoComponent implements OnInit {
  fileToUpload: File = null;
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

  crearProductoForm: FormGroup;
  images: any = null;
  grupos: any[] = [];
  almacenes: any[] = [];
  productos: any[] = [];
  tempProductos: any[] = [];
  tempCodigos: any[] = [];
  private alive: boolean = true;
  stockA: number = 0;

  monedas: any = [
    { nombre: "NUEVO SOL", value: "PEN" },
    { nombre: "DOLAR AMERICANO", value: "USD" },
    { nombre: "EURO", value: "EUR" }
  ];

  nombreExist: boolean = false;
  codigoExist: boolean = false;
  crearProd: boolean = true;
  nombreCodigo: string = "";
  message: string = "";

  constructor(
    private fb: FormBuilder,
    private inventariosService: InventariosService,
    private toast: ToastrService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.inventariosService.currentDataProductos
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.productos = res;
      });

    this.inventariosService.currentDataGrupos
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.grupos = res;
      });

    this.inventariosService.currentDataAlmacenes
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.almacenes = res;
      });

    this.crearProductoForm = this.fb.group({
      Grupo: ["", Validators.required],
      Zona: ["", Validators.required],
      Nombre: ["", Validators.required],
      Codigo: ["", Validators.required],
      Unidad: ["", Validators.required],
      Stock_inicial: [0, Validators.required],
      Stocke: [0, Validators.required],
      Offset_stocka: [0, Validators.required],
      Stocka: [this.stockA, Validators.required],
      Padre: "",
      CantidadPaq: "",
      Moneda: ["", Validators.required],
      Compra: ["", Validators.required],
      Venta: ["", Validators.required],
      Imagen: null,
      avatar: null,
      Serie: 0
    });
  }

  onSubmit() {
    if (this.crearProd) {
      this.crearProductoForm.patchValue({
        Compra: this.crearProductoForm.value["Compra"].toFixed(2),
        Venta: this.crearProductoForm.value["Venta"].toFixed(2)
      });
      this.inventariosService.crearProducto(this.crearProductoForm.value);
      if (this.images) {
        this.inventariosService
          .guardarImagen(this.images)
          .pipe(takeWhile(() => this.alive))
          .subscribe(data => {});
      }
    }
    this.cd.markForCheck();
  }

  calcAlarma() {
    this.stockA =
      this.crearProductoForm.value["Stocke"] *
      (1 + this.crearProductoForm.value["Offset_stocka"] / 100);
    this.crearProductoForm.patchValue({
      Stocka: this.stockA
    });
  }

  imageFinishedUploading(file) {
    this.images = file.file;
    this.crearProductoForm.patchValue({ Imagen: file.file.name });
  }

  onRemoved() {
    this.images = null;
    this.crearProductoForm.patchValue({ Imagen: null });
  }

  checkByNombre(target: string) {
    this.nombreExist = false;
    if (
      this.productos.filter(producto => producto["Nombre"] === target).length >
      0
    ) {
      this.nombreExist = true;
    }
  }

  checkByCodigo(target: string) {
    this.codigoExist = false;
    this.tempCodigos = this.productos.filter(
      producto => producto["Codigo"] === target
    );

    if (this.tempCodigos.length > 0) {
      this.nombreCodigo = this.tempCodigos[0]["Nombre"];
      this.codigoExist = true;
    }
  }

  /*
  checkByAlmacen(nombre:string, codigo:string, almacen:string) {
    this.tempProductos = this.productos.filter( producto => this.checkDuplicates(producto, nombre, codigo, almacen))
  }*/

  checkDuplicates(nombre: string, codigo: string, almacen: string) {
    this.crearProd = true;

    this.productos.forEach(element => {
      if (
        element["Nombre"] === nombre &&
        element["Codigo"] === codigo &&
        element["Zona"] === almacen
      ) {
        this.message =
          "El producto: (" +
          nombre +
          ", " +
          codigo +
          ") ya existe en el almacen: " +
          almacen;
        this.crearProd = false;
      }

      if (
        element["Nombre"] === nombre &&
        element["Codigo"] === codigo &&
        element["Zona"] !== almacen
      ) {
        this.message =
          "Se duplicará el producto: (" +
          nombre +
          ", " +
          codigo +
          ") en el almacen: " +
          almacen;
      }

      if (
        element["Nombre"] === nombre &&
        element["Codigo"] !== codigo &&
        element["Zona"] === almacen
      ) {
        this.message =
          "No se puede asignar el código (" +
          codigo +
          ") a un producto existente";
        this.crearProd = false;
      }

      if (
        element["Nombre"] === nombre &&
        element["Codigo"] !== codigo &&
        element["Zona"] !== almacen
      ) {
        this.message =
          "No se puede asignar el código (" +
          codigo +
          ") a un producto existente";
        this.crearProd = false;
      }

      if (
        element["Nombre"] !== nombre &&
        element["Codigo"] === codigo &&
        element["Zona"] === almacen
      ) {
        this.message =
          "No se puede asignar (" + nombre + ") a un código existente";
        this.crearProd = false;
      }

      if (
        element["Nombre"] !== nombre &&
        element["Codigo"] === codigo &&
        element["Zona"] !== almacen
      ) {
        this.message =
          "No se puede asignar (" + nombre + ") a un código existente";
        this.crearProd = false;
      }
    });

    if (this.message !== "") {
      this.toast.warning(this.message, "Cerrar");
    }
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
