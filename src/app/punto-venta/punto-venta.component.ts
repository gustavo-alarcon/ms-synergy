import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ClientsComponent } from "./clients/clients.component";
import { PaymentComponent } from "./payment/payment.component";
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger
} from "@angular/animations";
import { ListCustomers } from "../classes/listCustomers";
import { PosService } from "../servicios/pos.service";
import * as crypto from "crypto-js";
import { takeWhile } from "rxjs/operators";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Client } from "../ms-text/history/history.component";

@Component({
  selector: "app-punto-venta",
  templateUrl: "./punto-venta.component.html",
  styleUrls: ["./punto-venta.component.css"],
  animations: [
    trigger("cardProduct", [
      transition(
        ":enter",
        animate(
          "700ms ease-in",
          keyframes([
            style({ opacity: 0, transform: "translateY(-80%)", offset: 0 }),
            style({ opacity: 1, transform: "translateY(35px)", offset: 0.5 }),
            style({ opacity: 1, transform: "translateY(0)", offset: 1.0 })
          ])
        )
      ),
      transition(
        ":leave",
        animate(
          "400ms ease-in",
          keyframes([
            style({ opacity: 1, transform: "translateY(0)", offset: 0 }),
            style({ opacity: 0.5, transform: "translateY(25px)", offset: 0.3 }),
            style({ opacity: 0, transform: "translateX(-1000px)", offset: 1 })
          ])
        )
      )
    ]),
    trigger("totalTaxes", [
      state("void", style({ opacity: 0 })),
      transition(":enter, :leave", [animate(500)])
    ]),
    trigger("fadeList", [
      state("void", style({ opacity: 0 })),
      transition(":enter, :leave", [animate(300)])
    ]),
    trigger("images", [
      state("void", style({ opacity: 0 })),
      transition(":enter, :leave", [animate(900)])
    ]),
    trigger("tab", [
      transition(
        ":enter",
        animate(
          "700ms ease-in",
          keyframes([
            style({ opacity: 0, transform: "translateX(100px)", offset: 0 }),
            style({ opacity: 1, transform: "translateX(0)", offset: 1.0 })
          ])
        )
      )
    ]),
    trigger("menuInOut", [
      state("close", style({ opacity: 0, display: "none" })),
      transition(
        "close => open",
        animate(
          "500ms ease-in",
          keyframes([
            style({ display: "block", opacity: 0, offset: 0 }),
            style({ opacity: 0.5, offset: 0.5 }),
            style({ opacity: 1, offset: 1.0 })
          ])
        )
      ),
      transition(
        "open => close",
        animate(
          "500ms ease-in",
          keyframes([
            style({ opacity: 1, offset: 0 }),
            style({ opacity: 0.5, offset: 0.5 }),
            style({ opacity: 0, display: "none", offset: 1.0 })
          ])
        )
      )
    ])
  ]
})
export class PuntoVentaComponent implements OnInit {
  selectedIndex: any;
  clicked = false;
  almacenes: any[] = [];
  documentos: any[] = [];
  productos_filtrado: any[] = [];
  pack_nombre: any[] = [];
  productos: any[] = [];
  paquetes_filtrado: any[] = [];
  paquetes: any[] = [];
  filteredOptions: any[];
  movimientoForm: FormGroup;
  filteredPackages: any[];
  tabNumber: number = 1;
  selectedWarehouse: string = "";
  productsOrPackages: number = 0;
  optionDisplay: number = 1;
  disabledToogle = false;
  listCustomers: ListCustomers[] = [];
  currentCustomer: number = 0;
  lastItemClicked: number = null;
  changeItemClicked: number = null;
  checked: boolean;
  operationOption: number = 1;
  igvType: number = 1;
  numerosSerie: any[];
  hideProducts: boolean = false;
  bytes = crypto.AES.decrypt(localStorage.getItem("db"), "meraki");
  bd = this.bytes.toString(crypto.enc.Utf8);
  nameBytes = crypto.AES.decrypt(localStorage.getItem("user"), "meraki");
  user = this.nameBytes.toString(crypto.enc.Utf8);
  client: FormControl;
  isLoadingResults = true;
  isLoadingResultsCheck = false;
  listBytes: any = null;
  list: any = null;
  tabBytes: any = null;
  tab: any = null;
  private alive: boolean = true;
  bdParsed = JSON.parse(this.bd);
  formSelectNumSeries: FormGroup;
  numSeriesInProduct: FormArray;

  constructor(
    private posService: PosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.formSelectNumSeries = this.formBuilder.group({
      numSeriesArray: this.formBuilder.array([])
    });
    if (JSON.parse(localStorage.getItem("tab")) != null) {
      this.selectedIndex = JSON.parse(localStorage.getItem("tab"));
      this.currentCustomer = this.selectedIndex;
    }

    if (localStorage.getItem("list") == null) {
      this.listCustomers.push({
        listAction: [],
        total: 0,
        taxes: 0,
        subtotal: 0,
        lastItemClicked: null,
        client: { Nombre: "Cliente" },
        igvType: 1,
        documento: null,
        serie: null,
        correlativo: null,
        given: null,
        change: null,
        paymentType: null,
        user: JSON.parse(this.user),
        date: null
      });
    } else {
      this.listBytes = crypto.AES.decrypt(
        localStorage.getItem("list"),
        "meraki"
      );
      this.list = this.listBytes.toString(crypto.enc.Utf8);
      this.listCustomers = JSON.parse(this.list);
      if (this.listCustomers[this.currentCustomer].listAction != []) {
        this.formSelectNumSeries = this.formBuilder.group({
          numSeriesArray: this.formBuilder.array([])
        });

        for (
          let i = 0;
          i < this.listCustomers[this.currentCustomer].listAction.length;
          i++
        ) {
          this.addNumSerie();
          let numSeriesForm = this.formSelectNumSeries.get(
            "numSeriesArray"
          ) as FormArray;
          numSeriesForm.controls[i].patchValue({
            numSeriesSelected: this.listCustomers[this.currentCustomer]
              .listAction[i].seriesSelected
          });
        }
        /*for (
          let i = 0;
          i < this.listCustomers[this.currentCustomer].listAction.length;
          i++
        ) {
          let numSeriesForm = this.formSelectNumSeries.get(
            "numSeriesArray"
          ) as FormArray;
          numSeriesForm.controls[i].patchValue({
            numSeriesSelected: this.listCustomers[this.currentCustomer]
              .listAction[i].numSeries
          });
        }*/
      } else {
        this.formSelectNumSeries = this.formBuilder.group({
          numSeriesArray: this.formBuilder.array([])
        });
      }
    }

    this.movimientoForm = this.fb.group({
      Producto: "",
      Paquete: ""
    });

    this.loadWarehouse();

    this.client = new FormControl({
      value: this.listCustomers[this.currentCustomer].client.Nombre,
      disabled: true
    });
  }

  ngOnInit() {}

  loadWarehouse() {
    this.isLoadingResults = true;
    this.posService
      .getWarehouse(this.bd)
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.almacenes = res.records;
        this.almacenes.sort(this.sortBy("Nombre"));
        this.getProductsBD();
      });
  }

  getProductsBD() {
    this.posService
      .getProducts(this.bd)
      .takeWhile(() => this.alive)
      .subscribe(res => {
        this.productos = res.records;
        this.productos.sort(this.sortBy("Nombre"));
        this.getPackagesBD();
      });
  }

  getPackagesBD() {
    this.posService
      .getPackages(this.bd)
      .takeWhile(() => this.alive)
      .subscribe(res => {
        this.isLoadingResults = false;
        this.paquetes = res.records;
        this.cd.markForCheck();
      });
  }

  onTabClick(e) {
    this.productsOrPackages = e.index;
    if (e.index == 1) {
      this.disabledToogle = !this.disabledToogle;
      this.checked = false;
      this.optionDisplay = 1;
    } else this.disabledToogle = !this.disabledToogle;
  }

  createNumSerie(): FormGroup {
    return this.formBuilder.group({
      numSeriesSelected: []
    });
  }

  addNumSerie(): void {
    this.numSeriesInProduct = this.formSelectNumSeries.get(
      "numSeriesArray"
    ) as FormArray;
    this.numSeriesInProduct.push(this.createNumSerie());
  }

  deleteNumSerie(): void {
    /*this.numSeriesInProduct = this.formSelectNumSeries.get('numSeriesInProduct') as FormArray;
    this.numSeriesInProduct.slice(this.createItem());*/
  }

  onSelectCustomer(e) {
    this.currentCustomer = e;
    this.client.patchValue(
      this.listCustomers[this.currentCustomer].client.Nombre
    );
    for (
      let i = 0;
      i < this.listCustomers[this.currentCustomer].listAction.length;
      i++
    ) {
      this.addNumSerie();
      let numSeriesForm = this.formSelectNumSeries.get(
        "numSeriesArray"
      ) as FormArray;
      numSeriesForm.controls[i].patchValue({
        numSeriesSelected: this.listCustomers[this.currentCustomer].listAction[
          i
        ].seriesSelected
      });
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  changeOperationType(i) {
    this.operationOption = i;
  }

  eraseCustomer(i) {
    if (this.listCustomers.length != 1) {
      this.listCustomers.splice(i, 1);
      this.currentCustomer = i - 1;
      this.selectedIndex = this.currentCustomer;
      localStorage.setItem("tab", JSON.stringify(this.selectedIndex));
      this.client.patchValue(
        this.listCustomers[this.currentCustomer].client.Nombre
      );
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  clickProductList(i) {
    if (this.lastItemClicked == null) {
      this.listCustomers[
        this.currentCustomer
      ].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[
        i
      ].id;
    } else {
      this.listCustomers[
        this.currentCustomer
      ].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[
        i
      ].id;
    }
  }

  executeOperation(int) {
    if (this.listCustomers[this.currentCustomer].listAction.length != 0) {
      for (
        let i = 0;
        i < this.listCustomers[this.currentCustomer].listAction.length;
        i++
      ) {
        if (
          this.listCustomers[this.currentCustomer].lastItemClicked ==
            this.listCustomers[this.currentCustomer].listAction[i].id &&
          this.operationOption == 1
        ) {
          if (int != ".") {
            if (
              parseInt(
                this.listCustomers[this.currentCustomer].listAction[i].units +
                  int
              ) <=
              this.listCustomers[this.currentCustomer].listAction[i]
                .cantidadMaxima
            ) {
              this.listCustomers[this.currentCustomer].listAction[i].units =
                this.listCustomers[this.currentCustomer].listAction[i].units +
                int;
              let numSeriesSeleccionados = [];
              for (
                let j = 0;
                j <
                this.listCustomers[this.currentCustomer].listAction[i]
                  .listNumSeries.length;
                j++
              ) {
                if (
                  numSeriesSeleccionados.length ==
                  parseInt(
                    this.listCustomers[this.currentCustomer].listAction[i].units
                  )
                ) {
                  break;
                } else {
                  if (
                    this.listCustomers[this.currentCustomer].listAction[i]
                      .listNumSeries[j].almacen == this.selectedWarehouse
                  ) {
                    numSeriesSeleccionados.push(
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .listNumSeries[j].numSerie
                    );
                  }
                }
              }
              let numSeriesForm = this.formSelectNumSeries.get(
                "numSeriesArray"
              ) as FormArray;
              numSeriesForm.controls[i].patchValue({
                numSeriesSelected: numSeriesSeleccionados
              });
              this.listCustomers[this.currentCustomer].listAction[
                i
              ].seriesSelected = numSeriesSeleccionados;
              if (this.verifyValue(i)) {
                this.listCustomers[this.currentCustomer].listAction[i].price =
                  parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i]
                      .unitPrice
                  ) *
                  parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i].units
                  );
                this.listCustomers[this.currentCustomer].listAction[
                  i
                ].price = parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i].price
                ).toFixed(2);
                if (
                  this.listCustomers[this.currentCustomer].listAction[i].dsc !=
                  ""
                ) {
                  this.listCustomers[this.currentCustomer].listAction[i].price =
                    parseFloat(
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .price
                    ) *
                    (100 -
                      parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .dsc
                      )) /
                    100;
                  this.listCustomers[this.currentCustomer].listAction[
                    i
                  ].price = parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i].price
                  ).toFixed(2);
                }
              } else
                this.listCustomers[this.currentCustomer].listAction[i].price =
                  "";
              this.calculateTotalAndTaxes();
              let list = crypto.AES.encrypt(
                JSON.stringify(this.listCustomers),
                "meraki"
              );
              localStorage.setItem("list", list);
              return;
            }
          } else {
            let list = crypto.AES.encrypt(
              JSON.stringify(this.listCustomers),
              "meraki"
            );
            localStorage.setItem("list", list);
            return;
          }
        }
        if (
          this.listCustomers[this.currentCustomer].lastItemClicked ==
            this.listCustomers[this.currentCustomer].listAction[i].id &&
          this.operationOption == 2
        ) {
          if (
            this.listCustomers[this.currentCustomer].listAction[i].dsc == "100"
          ) {
            return;
          }
          if (int == ".") {
            for (
              let x = 0;
              x <
              this.listCustomers[this.currentCustomer].listAction[i].dsc.length;
              x++
            )
              if (
                this.listCustomers[this.currentCustomer].listAction[i].dsc[x] ==
                "."
              ) {
                return;
              }
          }
          this.listCustomers[this.currentCustomer].listAction[i].dsc =
            this.listCustomers[this.currentCustomer].listAction[i].dsc + int;
          if (
            parseFloat(
              this.listCustomers[this.currentCustomer].listAction[i].dsc
            ) > 100
          )
            this.listCustomers[this.currentCustomer].listAction[i].dsc = "100";
          if (
            this.listCustomers[this.currentCustomer].listAction[i].dsc != "" &&
            this.listCustomers[this.currentCustomer].listAction[i].units !=
              "" &&
            this.listCustomers[this.currentCustomer].listAction[i].unitPrice !=
              ""
          ) {
            if (
              this.listCustomers[this.currentCustomer].listAction[i].dsc[
                this.listCustomers[this.currentCustomer].listAction[i].dsc
                  .length - 1
              ] != "."
            ) {
              this.listCustomers[this.currentCustomer].listAction[i].price =
                parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i].price
                ) *
                (100 -
                  parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i].dsc
                  )) /
                100;
              this.listCustomers[this.currentCustomer].listAction[
                i
              ].price = parseFloat(
                this.listCustomers[this.currentCustomer].listAction[i].price
              ).toFixed(2);
            }
          } else
            this.listCustomers[this.currentCustomer].listAction[i].price = "";
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(
            JSON.stringify(this.listCustomers),
            "meraki"
          );
          localStorage.setItem("list", list);
          return;
        }
        if (
          this.listCustomers[this.currentCustomer].lastItemClicked ==
            this.listCustomers[this.currentCustomer].listAction[i].id &&
          this.operationOption == 3
        ) {
          if (int == ".") {
            for (
              let x = 0;
              x <
              this.listCustomers[this.currentCustomer].listAction[i].unitPrice
                .length;
              x++
            )
              if (
                this.listCustomers[this.currentCustomer].listAction[i]
                  .unitPrice[x] == "."
              ) {
                return;
              }
          }
          this.listCustomers[this.currentCustomer].listAction[i].unitPrice =
            this.listCustomers[this.currentCustomer].listAction[i].unitPrice +
            int;
          if (this.verifyValue(i)) {
            if (
              this.listCustomers[this.currentCustomer].listAction[i].unitPrice[
                this.listCustomers[this.currentCustomer].listAction[i].unitPrice
                  .length - 1
              ] != "."
            ) {
              this.listCustomers[this.currentCustomer].listAction[i].price =
                parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i]
                    .unitPrice
                ) *
                parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i].units
                );
              this.listCustomers[this.currentCustomer].listAction[
                i
              ].price = parseFloat(
                this.listCustomers[this.currentCustomer].listAction[i].price
              ).toFixed(2);
              if (
                this.listCustomers[this.currentCustomer].listAction[i].dsc != ""
              ) {
                this.listCustomers[this.currentCustomer].listAction[i].price =
                  parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i].price
                  ) *
                  (100 -
                    parseFloat(
                      this.listCustomers[this.currentCustomer].listAction[i].dsc
                    )) /
                  100;
                this.listCustomers[this.currentCustomer].listAction[
                  i
                ].price = parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i].price
                ).toFixed(2);
              }
            }
          } else
            this.listCustomers[this.currentCustomer].listAction[i].price = "";
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(
            JSON.stringify(this.listCustomers),
            "meraki"
          );
          localStorage.setItem("list", list);
          return;
        }
      }
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  calculateTotalAndTaxes() {
    this.listCustomers[this.currentCustomer].total = 0;
    this.listCustomers[this.currentCustomer].taxes = 0;
    this.listCustomers[this.currentCustomer].subtotal = 0;

    if (this.listCustomers[this.currentCustomer].igvType == 1) {
      for (
        let i = 0;
        i < this.listCustomers[this.currentCustomer].listAction.length;
        i++
      ) {
        this.listCustomers[this.currentCustomer].total += +this.listCustomers[
          this.currentCustomer
        ].listAction[i].price;
      }
      if (this.listCustomers[this.currentCustomer].total > 0) {
        this.listCustomers[this.currentCustomer].subtotal =
          this.listCustomers[this.currentCustomer].total / 1.18;
        this.listCustomers[this.currentCustomer].taxes =
          this.listCustomers[this.currentCustomer].total -
          this.listCustomers[this.currentCustomer].subtotal;
      }
      this.listCustomers[this.currentCustomer].total = parseFloat(
        this.listCustomers[this.currentCustomer].total.toFixed(2)
      );
      this.listCustomers[this.currentCustomer].taxes = parseFloat(
        this.listCustomers[this.currentCustomer].taxes.toFixed(2)
      );
      this.listCustomers[this.currentCustomer].subtotal = parseFloat(
        this.listCustomers[this.currentCustomer].subtotal.toFixed(2)
      );
    }

    if (this.listCustomers[this.currentCustomer].igvType == 2) {
      for (
        let i = 0;
        i < this.listCustomers[this.currentCustomer].listAction.length;
        i++
      ) {
        this.listCustomers[this.currentCustomer].total += +this.listCustomers[
          this.currentCustomer
        ].listAction[i].price;
      }
      if (this.listCustomers[this.currentCustomer].total > 0) {
        this.listCustomers[this.currentCustomer].subtotal = this.listCustomers[
          this.currentCustomer
        ].total;
        this.listCustomers[this.currentCustomer].total =
          this.listCustomers[this.currentCustomer].total * 1.18;
        this.listCustomers[this.currentCustomer].taxes =
          this.listCustomers[this.currentCustomer].total -
          this.listCustomers[this.currentCustomer].subtotal;
      }
      this.listCustomers[this.currentCustomer].total = parseFloat(
        this.listCustomers[this.currentCustomer].total.toFixed(2)
      );
      this.listCustomers[this.currentCustomer].taxes = parseFloat(
        this.listCustomers[this.currentCustomer].taxes.toFixed(2)
      );
      this.listCustomers[this.currentCustomer].subtotal = parseFloat(
        this.listCustomers[this.currentCustomer].subtotal.toFixed(2)
      );
    }

    if (this.listCustomers[this.currentCustomer].igvType == 3) {
      for (
        let i = 0;
        i < this.listCustomers[this.currentCustomer].listAction.length;
        i++
      ) {
        this.listCustomers[this.currentCustomer].total += +this.listCustomers[
          this.currentCustomer
        ].listAction[i].price;
      }
      this.listCustomers[this.currentCustomer].total = parseFloat(
        this.listCustomers[this.currentCustomer].total.toFixed(2)
      );
    }
  }

  backspace() {
    if (this.listCustomers[this.currentCustomer].listAction.length != 0) {
      for (
        let i = 0;
        i < this.listCustomers[this.currentCustomer].listAction.length;
        i++
      ) {
        if (
          this.listCustomers[this.currentCustomer].lastItemClicked ==
            this.listCustomers[this.currentCustomer].listAction[i].id &&
          this.operationOption == 1
        ) {
          if (
            this.listCustomers[this.currentCustomer].listAction[i].units == ""
          ) {
            this.listCustomers[this.currentCustomer].listAction.splice(i, 1);
            if (
              this.listCustomers[this.currentCustomer].listAction.length > 1
            ) {
              if (i != 0)
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[i - 1].id;
              else
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[0].id;
            } else {
              if (
                this.listCustomers[this.currentCustomer].listAction.length != 0
              )
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[0].id;
            }
          } else {
            if (
              this.listCustomers[this.currentCustomer].listAction[i].units
                .length != 0
            ) {
              if (
                parseInt(
                  this.listCustomers[this.currentCustomer].listAction[
                    i
                  ].units.slice(0, -1)
                ) <=
                  this.listCustomers[this.currentCustomer].listAction[i]
                    .cantidadMaxima ||
                this.listCustomers[this.currentCustomer].listAction[
                  i
                ].units.slice(0, -1) == ""
              ) {
                this.listCustomers[this.currentCustomer].listAction[
                  i
                ].units = this.listCustomers[this.currentCustomer].listAction[
                  i
                ].units.slice(0, -1);
                let numSeriesSeleccionados = [];
                for (
                  let j = 0;
                  j <
                  this.listCustomers[this.currentCustomer].listAction[i]
                    .listNumSeries.length;
                  j++
                ) {
                  if (
                    numSeriesSeleccionados.length ==
                      parseInt(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .units
                      ) ||
                    this.listCustomers[this.currentCustomer].listAction[i]
                      .units == ""
                  ) {
                    break;
                  } else {
                    if (
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .listNumSeries[j].almacen == this.selectedWarehouse
                    ) {
                      numSeriesSeleccionados.push(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .listNumSeries[j].numSerie
                      );
                    }
                  }
                }
                let numSeriesForm = this.formSelectNumSeries.get(
                  "numSeriesArray"
                ) as FormArray;
                numSeriesForm.controls[i].patchValue({
                  numSeriesSelected: numSeriesSeleccionados
                });
                this.listCustomers[this.currentCustomer].listAction[
                  i
                ].seriesSelected = numSeriesSeleccionados;
                if (this.verifyValue(i)) {
                  if (
                    this.listCustomers[this.currentCustomer].listAction[i]
                      .units[
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .units.length - 1
                    ] != "."
                  ) {
                    this.listCustomers[this.currentCustomer].listAction[
                      i
                    ].price =
                      parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .unitPrice
                      ) *
                      parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .units
                      );
                    this.listCustomers[this.currentCustomer].listAction[
                      i
                    ].price = parseFloat(
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .price
                    ).toFixed(2);
                    if (
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .dsc != ""
                    ) {
                      this.listCustomers[this.currentCustomer].listAction[
                        i
                      ].price =
                        parseFloat(
                          this.listCustomers[this.currentCustomer].listAction[i]
                            .price
                        ) *
                        (100 -
                          parseFloat(
                            this.listCustomers[this.currentCustomer].listAction[
                              i
                            ].dsc
                          )) /
                        100;
                      this.listCustomers[this.currentCustomer].listAction[
                        i
                      ].price = parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .price
                      ).toFixed(2);
                    }
                  }
                } else {
                  this.listCustomers[this.currentCustomer].listAction[i].price =
                    "";
                }
              }
            }
          }
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(
            JSON.stringify(this.listCustomers),
            "meraki"
          );
          localStorage.setItem("list", list);
          return;
        }
        if (
          this.listCustomers[this.currentCustomer].lastItemClicked ==
            this.listCustomers[this.currentCustomer].listAction[i].id &&
          this.operationOption == 2
        ) {
          if (
            this.listCustomers[this.currentCustomer].listAction[i].dsc == ""
          ) {
            this.listCustomers[this.currentCustomer].listAction.splice(i, 1);
            if (
              this.listCustomers[this.currentCustomer].listAction.length > 1
            ) {
              if (i != 0)
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[i - 1].id;
              else
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[0].id;
            } else {
              if (
                this.listCustomers[this.currentCustomer].listAction.length != 0
              )
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[0].id;
            }
          } else {
            if (
              this.listCustomers[this.currentCustomer].listAction[i].dsc
                .length != 0
            ) {
              this.listCustomers[this.currentCustomer].listAction[
                i
              ].dsc = this.listCustomers[this.currentCustomer].listAction[
                i
              ].dsc.slice(0, -1);
              if (this.verifyValue(i)) {
                this.listCustomers[this.currentCustomer].listAction[i].price =
                  parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i]
                      .unitPrice
                  ) *
                  parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i].units
                  );
                this.listCustomers[this.currentCustomer].listAction[
                  i
                ].price = parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i].price
                ).toFixed(2);
                if (
                  this.listCustomers[this.currentCustomer].listAction[i].dsc !=
                  ""
                ) {
                  if (
                    this.listCustomers[this.currentCustomer].listAction[i].dsc[
                      this.listCustomers[this.currentCustomer].listAction[i].dsc
                        .length - 1
                    ] != "."
                  ) {
                    this.listCustomers[this.currentCustomer].listAction[
                      i
                    ].price =
                      parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .price
                      ) *
                      (100 -
                        parseFloat(
                          this.listCustomers[this.currentCustomer].listAction[i]
                            .dsc
                        )) /
                      100;
                    this.listCustomers[this.currentCustomer].listAction[
                      i
                    ].price = parseFloat(
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .price
                    ).toFixed(2);
                  }
                }
              } else {
                this.listCustomers[this.currentCustomer].listAction[i].price =
                  "";
              }
            }
          }
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(
            JSON.stringify(this.listCustomers),
            "meraki"
          );
          localStorage.setItem("list", list);
          return;
        }
        if (
          this.listCustomers[this.currentCustomer].lastItemClicked ==
            this.listCustomers[this.currentCustomer].listAction[i].id &&
          this.operationOption == 3
        ) {
          if (
            this.listCustomers[this.currentCustomer].listAction[i].unitPrice ==
            ""
          ) {
            this.listCustomers[this.currentCustomer].listAction.splice(i, 1);
            if (
              this.listCustomers[this.currentCustomer].listAction.length > 1
            ) {
              if (i != 0)
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[i - 1].id;
              else
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[0].id;
            } else {
              if (
                this.listCustomers[this.currentCustomer].listAction.length != 0
              )
                this.listCustomers[
                  this.currentCustomer
                ].lastItemClicked = this.listCustomers[
                  this.currentCustomer
                ].listAction[0].id;
            }
          } else {
            if (
              this.listCustomers[this.currentCustomer].listAction[i].unitPrice
                .length != 0
            ) {
              if (
                this.listCustomers[this.currentCustomer].listAction[i].unitPrice
                  .length == 2 &&
                this.listCustomers[this.currentCustomer].listAction[i]
                  .unitPrice[0] == "-"
              ) {
                this.listCustomers[this.currentCustomer].listAction[
                  i
                ].unitPrice =
                  "";
              } else
                this.listCustomers[this.currentCustomer].listAction[
                  i
                ].unitPrice = this.listCustomers[
                  this.currentCustomer
                ].listAction[i].unitPrice.slice(0, -1);
              if (this.verifyValue(i)) {
                if (
                  this.listCustomers[this.currentCustomer].listAction[i]
                    .unitPrice[
                    this.listCustomers[this.currentCustomer].listAction[i]
                      .unitPrice.length - 1
                  ] != "."
                ) {
                  this.listCustomers[this.currentCustomer].listAction[i].price =
                    parseFloat(
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .unitPrice
                    ) *
                    parseFloat(
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .units
                    );
                  this.listCustomers[this.currentCustomer].listAction[
                    i
                  ].price = parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i].price
                  ).toFixed(2);
                  if (
                    this.listCustomers[this.currentCustomer].listAction[i]
                      .dsc != ""
                  ) {
                    this.listCustomers[this.currentCustomer].listAction[
                      i
                    ].price =
                      parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .price
                      ) *
                      (100 -
                        parseFloat(
                          this.listCustomers[this.currentCustomer].listAction[i]
                            .dsc
                        )) /
                      100;
                    this.listCustomers[this.currentCustomer].listAction[
                      i
                    ].price = parseFloat(
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .price
                    ).toFixed(2);
                  }
                }
              } else {
                this.listCustomers[this.currentCustomer].listAction[i].price =
                  "";
              }
            }
          }
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(
            JSON.stringify(this.listCustomers),
            "meraki"
          );
          localStorage.setItem("list", list);
          return;
        }
      }
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  verifyValue(i) {
    if (
      this.listCustomers[this.currentCustomer].listAction[i].units != "" &&
      this.listCustomers[this.currentCustomer].listAction[i].unitPrice != ""
    ) {
      return true;
    } else return false;
  }

  addPlusOrNegative() {
    if (this.listCustomers[this.currentCustomer].listAction.length != 0) {
      for (
        let i = 0;
        i < this.listCustomers[this.currentCustomer].listAction.length;
        i++
      ) {
        if (
          this.listCustomers[this.currentCustomer].lastItemClicked ==
          this.listCustomers[this.currentCustomer].listAction[i].id
        ) {
          if (
            this.listCustomers[this.currentCustomer].listAction[i].unitPrice !=
            ""
          ) {
            if (
              this.listCustomers[this.currentCustomer].listAction[i]
                .unitPrice[0] == "-"
            )
              this.listCustomers[this.currentCustomer].listAction[
                i
              ].unitPrice = this.listCustomers[this.currentCustomer].listAction[
                i
              ].unitPrice.substr(1);
            else
              this.listCustomers[this.currentCustomer].listAction[i].unitPrice =
                "-" +
                this.listCustomers[this.currentCustomer].listAction[i]
                  .unitPrice;
          }
          if (this.verifyValue(i)) {
            this.listCustomers[this.currentCustomer].listAction[i].price =
              parseFloat(
                this.listCustomers[this.currentCustomer].listAction[i].unitPrice
              ) *
              parseFloat(
                this.listCustomers[this.currentCustomer].listAction[i].units
              );
            if (
              this.listCustomers[this.currentCustomer].listAction[i].dsc != ""
            ) {
              this.listCustomers[this.currentCustomer].listAction[i].price =
                parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i].price
                ) *
                (100 -
                  parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i].dsc
                  )) /
                100;
            }
          }
          this.calculateTotalAndTaxes();
          let list = crypto.AES.encrypt(
            JSON.stringify(this.listCustomers),
            "meraki"
          );
          localStorage.setItem("list", list);
          return;
        }
      }
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  changeIGVType() {
    this.calculateTotalAndTaxes();
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  sortBy(key) {
    return function(a, b) {
      if (a[key] > b[key]) {
        return 1;
      } else if (a[key] < b[key]) {
        return -1;
      }
      [];
      return 0;
    };
  }

  slideToogleChange(e) {
    if (e.checked) {
      this.optionDisplay = 2;
      this.checked = true;
    } else {
      this.optionDisplay = 1;
      this.checked = false;
    }
  }

  filtrarProductos(alm: string) {
    this.productos_filtrado = [];
    this.paquetes_filtrado = [];
    this.productos.forEach(element => {
      if (element["Zona"] === alm) {
        this.productos_filtrado.push(element);
      }
    });

    this.paquetes.forEach(element => {
      if (element["Almacen"] === alm) {
        this.paquetes_filtrado.push(element);
      }
    });
    let _nombre = "";
    let _position = 0;
    this.pack_nombre = [];
    for (let i = 0; i < this.paquetes_filtrado.length; i++) {
      if (this.paquetes_filtrado[i].Paquete != _nombre) {
        this.pack_nombre.push({
          Nombre: this.paquetes_filtrado[i].Paquete,
          Venta:
            this.paquetes_filtrado[i].Venta *
            this.paquetes_filtrado[i].Cantidad,
          ID: this.paquetes_filtrado[i].ID,
          Moneda: this.paquetes_filtrado[i].Moneda,
          Productos: []
        });
        this.pack_nombre[this.pack_nombre.length - 1].Productos.push({
          nombre: this.paquetes_filtrado[i].Nombre,
          precio: this.paquetes_filtrado[i].Venta,
          cantidad: this.paquetes_filtrado[i].Cantidad,
          id: this.paquetes_filtrado[i].IDProducto,
          Unidad: this.paquetes_filtrado[i].Unidad,
          Moneda: this.paquetes_filtrado[i].Moneda
        });
        _nombre = this.paquetes_filtrado[i].Paquete;
        _position = this.pack_nombre.length - 1;
      } else {
        this.pack_nombre[_position].Venta =
          parseFloat(this.pack_nombre[_position].Venta) +
          parseFloat(this.paquetes_filtrado[i].Venta);
        this.pack_nombre[_position].Productos.push({
          nombre: this.paquetes_filtrado[i].Nombre,
          precio: this.paquetes_filtrado[i].Venta,
          cantidad: this.paquetes_filtrado[i].Cantidad,
          id: this.paquetes_filtrado[i].IDProducto,
          Unidad: this.paquetes_filtrado[i].Unidad,
          Moneda: this.paquetes_filtrado[i].Moneda
        });
      }
    }
    this.filteredOptions = this.productos_filtrado;
    this.filteredPackages = this.pack_nombre;
  }

  pushKeyProducts() {
    this.filteredOptions = this.filterProducto(
      this.movimientoForm.value["Producto"]
    );
  }

  pushKeyPackage() {
    this.filteredPackages = this.filterPackage(
      this.movimientoForm.value["Paquete"]
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

  filterPackage(val): string[] {
    return this.pack_nombre.filter(
      option => option.Nombre.toLowerCase().indexOf(val.toLowerCase()) === 0
    );
  }

  enterProduct() {
    let index;
    if (this.filteredOptions.length == 0)
      this.toastr.warning("No hay ningun producto", "Cuidado");
    else {
      if (this.filteredOptions.length == 1) {
        for (let i = 0; i < this.productos_filtrado.length; i++) {
          if (this.productos_filtrado[i].ID == this.filteredOptions[0].ID)
            index = i;
        }
        this.addToList(index);
      }
    }
    this.movimientoForm.reset();
    this.filteredOptions = this.productos_filtrado;
  }

  addCustomer(lastClient?: Client) {
    if (lastClient) {
      this.listCustomers.push({
        listAction: [],
        total: 0,
        taxes: 0,
        subtotal: 0,
        lastItemClicked: null,
        client: lastClient,
        igvType: 1,
        documento: null,
        serie: null,
        correlativo: null,
        given: null,
        change: null,
        paymentType: null,
        user: JSON.parse(this.user),
        date: null
      });
    } else {
      this.listCustomers.push({
        listAction: [],
        total: 0,
        taxes: 0,
        subtotal: 0,
        lastItemClicked: null,
        client: { Nombre: "Cliente" },
        igvType: 1,
        documento: null,
        serie: null,
        correlativo: null,
        given: null,
        change: null,
        paymentType: null,
        user: JSON.parse(this.user),
        date: null
      });
    }
    this.currentCustomer = this.listCustomers.length - 1;
    this.client.patchValue(
      this.listCustomers[this.currentCustomer].client.Nombre
    );
    this.formSelectNumSeries = this.formBuilder.group({
      numSeriesArray: this.formBuilder.array([])
    });
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  tabChanged(e) {
    if (e.index == this.listCustomers.length) {
      this.selectedIndex = this.listCustomers.length - 1;
      this.formSelectNumSeries = this.formBuilder.group({
        numSeriesArray: this.formBuilder.array([])
      });
    }
    localStorage.setItem("tab", JSON.stringify(this.selectedIndex));
  }

  addToList(idx) {
    let i = null;
    for (let j = 0; j < this.productos_filtrado.length; j++) {
      if (this.filteredOptions[idx].Codigo == this.productos_filtrado[j].Codigo)
        i = j;
    }
    let alreadyIn = false;
    //Trabajo con productos
    if (this.productsOrPackages == 0) {
      for (
        let x = 0;
        x < this.listCustomers[this.currentCustomer].listAction.length;
        x++
      ) {
        if (
          this.listCustomers[this.currentCustomer].listAction[x].id ==
          this.productos_filtrado[i].Codigo
        )
          alreadyIn = true;
      }
      if (!alreadyIn) {
        this.isLoadingResultsCheck = true;
        this.posService
          .getNumSerie(this.bd, this.productos_filtrado[i].Nombre)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            data => {
              this.listCustomers[this.currentCustomer].listAction.push({
                price: this.productos_filtrado[i].Venta,
                product: this.productos_filtrado[i].Nombre,
                units: "",
                id: this.productos_filtrado[i].Codigo,
                dsc: "",
                unitPrice: "" + this.productos_filtrado[i].Venta,
                idReal: this.productos_filtrado[i].ID,
                package: 0,
                AlmacenOrigen: this.productos_filtrado[i].Zona,
                Cantidad: "",
                Moneda: this.productos_filtrado[i].Moneda,
                Paquete: "",
                Producto: this.productos_filtrado[i].Nombre,
                IDProducto: this.productos_filtrado[i].ID,
                Unidad: this.productos_filtrado[i].Unidad,
                Venta: this.productos_filtrado[i].Venta,
                listNumSeries: data.records,
                seriesSelected: [],
                cantidadMaxima: null
              });
              for (
                let i = 0;
                i <
                this.listCustomers[this.currentCustomer].listAction[
                  this.listCustomers[this.currentCustomer].listAction.length - 1
                ].listNumSeries.length;
                i++
              ) {
                if (
                  this.listCustomers[this.currentCustomer].listAction[
                    this.listCustomers[this.currentCustomer].listAction.length -
                      1
                  ].listNumSeries[i].almacen == this.selectedWarehouse
                ) {
                  this.listCustomers[this.currentCustomer].listAction[
                    this.listCustomers[this.currentCustomer].listAction.length -
                      1
                  ].cantidadMaxima++;
                }
              }
              this.listCustomers[this.currentCustomer].total += +this
                .listCustomers[this.currentCustomer].listAction[
                this.listCustomers[this.currentCustomer].listAction.length - 1
              ].price;
              this.listCustomers[this.currentCustomer].subtotal =
                this.listCustomers[this.currentCustomer].total / 1.18;
              this.listCustomers[this.currentCustomer].taxes =
                this.listCustomers[this.currentCustomer].total -
                this.listCustomers[this.currentCustomer].subtotal;
              this.listCustomers[
                this.currentCustomer
              ].lastItemClicked = this.productos_filtrado[i].Codigo;
              this.listCustomers[this.currentCustomer].total = parseFloat(
                this.listCustomers[this.currentCustomer].total.toFixed(2)
              );
              this.listCustomers[this.currentCustomer].taxes = parseFloat(
                this.listCustomers[this.currentCustomer].taxes.toFixed(2)
              );
              this.listCustomers[this.currentCustomer].subtotal = parseFloat(
                this.listCustomers[this.currentCustomer].subtotal.toFixed(2)
              );
              this.isLoadingResultsCheck = false;
              this.cd.markForCheck();
              this.addNumSerie();
            },
            err => {
              console.log(err);
              this.isLoadingResultsCheck = false;
              this.cd.markForCheck();
            }
          );
      } else {
        this.toastr.warning(
          "El producto ya esta en la lista de venta, haga click en el para aumentar la cantidad",
          "Cuidado"
        );
      }
    }
    //Trabajo con paquetes
    else {
      for (
        let x = 0;
        x < this.listCustomers[this.currentCustomer].listAction.length;
        x++
      ) {
        if (
          this.listCustomers[this.currentCustomer].listAction[x].id ==
          this.pack_nombre[i].ID
        )
          alreadyIn = true;
      }
      if (!alreadyIn) {
        this.listCustomers[this.currentCustomer].listAction.push({
          price: this.pack_nombre[i].Venta,
          product: this.pack_nombre[i].Nombre,
          units: "",
          id: this.pack_nombre[i].ID,
          dsc: "",
          unitPrice: "" + this.pack_nombre[i].Venta,
          products: this.pack_nombre[i].Productos,
          package: 1,
          AlmacenOrigen: this.pack_nombre[i].Almacen,
          Cantidad: "",
          Moneda: this.pack_nombre[i].Moneda,
          Paquete: this.pack_nombre[i].Nombre,
          Producto: this.pack_nombre[i].Nombre,
          IDProducto: this.pack_nombre[i].IDProducto,
          Unidad: this.pack_nombre[i].Unidad,
          Venta: this.pack_nombre[i].Venta
        });
        this.listCustomers[this.currentCustomer].total += +this.listCustomers[
          this.currentCustomer
        ].listAction[
          this.listCustomers[this.currentCustomer].listAction.length - 1
        ].price;
        this.listCustomers[this.currentCustomer].subtotal =
          this.listCustomers[this.currentCustomer].total / 1.18;
        this.listCustomers[this.currentCustomer].taxes =
          this.listCustomers[this.currentCustomer].total * 18 / 100;
        this.listCustomers[
          this.currentCustomer
        ].lastItemClicked = this.pack_nombre[i].ID;
        this.listCustomers[this.currentCustomer].total = parseFloat(
          this.listCustomers[this.currentCustomer].total.toFixed(2)
        );
        this.listCustomers[this.currentCustomer].taxes = parseFloat(
          this.listCustomers[this.currentCustomer].taxes.toFixed(2)
        );
        this.listCustomers[this.currentCustomer].subtotal = parseFloat(
          this.listCustomers[this.currentCustomer].subtotal.toFixed(2)
        );
      } else {
        this.toastr.warning(
          "El paquete ya esta en la lista de venta, haga click en el para aumentar la cantidad",
          "Cuidado"
        );
      }
    }
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  valueSerie(i) {
    this.listCustomers[this.currentCustomer].listAction[
      i
    ].units = this.formSelectNumSeries.controls.numSeriesArray.value[
      i
    ].numSeriesSelected.length;
  }

  openClients() {
    let dialogRef = this.dialog.open(ClientsComponent, {
      width: "auto",
      data: "text",
      autoFocus: false
    });

    dialogRef.beforeClose().subscribe(result => {
      if (result != "close" && result != undefined) {
        this.listCustomers[this.currentCustomer].client = result;
        this.client.patchValue(result.Nombre);
        let list = crypto.AES.encrypt(
          JSON.stringify(this.listCustomers),
          "meraki"
        );
        localStorage.setItem("list", list);
      }
    });
  }

  openPayment() {
    let hasEmptyProducts = false;
    for (
      let i = 0;
      i < this.listCustomers[this.currentCustomer].listAction.length;
      i++
    ) {
      if (this.listCustomers[this.currentCustomer].listAction[i].units == "")
        hasEmptyProducts = true;
      break;
    }
    if (
      this.listCustomers[this.currentCustomer].listAction.length != 0 &&
      this.listCustomers[this.currentCustomer].client.Nombre != "Cliente" &&
      hasEmptyProducts == false &&
      this.selectedWarehouse != ""
    ) {
      let dialogRef = this.dialog.open(PaymentComponent, {
        width: "auto",
        data: this.listCustomers[this.currentCustomer],
        autoFocus: false,
        panelClass: "custom-dialog"
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let lastClient;
          this.generatePDF();
          if (this.currentCustomer != 0) {
            this.listCustomers.splice(this.currentCustomer, 1);
            this.currentCustomer = this.currentCustomer - 1;
            this.selectedIndex = this.currentCustomer;
            localStorage.setItem("tab", JSON.stringify(this.selectedIndex));
          } else {
            this.listCustomers[this.currentCustomer].listAction = [];
            this.listCustomers[this.currentCustomer].total = 0;
            this.listCustomers[this.currentCustomer].taxes = 0;
            this.listCustomers[this.currentCustomer].subtotal = 0;
            this.listCustomers[this.currentCustomer].lastItemClicked = null;
            lastClient = this.listCustomers[this.currentCustomer].client;
            this.listCustomers.splice(0, 1);
            this.addCustomer(lastClient);
          }
          this.cd.markForCheck();
          this.isLoadingResults = true;
          this.getAllProducts(this.selectedWarehouse);
          let list = crypto.AES.encrypt(
            JSON.stringify(this.listCustomers),
            "meraki"
          );
          localStorage.setItem("list", list);
        }
      });
    } else if (
      this.listCustomers[this.currentCustomer].client.Nombre == "Cliente"
    )
      this.toastr.warning("Seleccione un cliente", "Cuidado");
    else if (hasEmptyProducts == true)
      this.toastr.warning("Tiene productos sin cantidad ingresada", "Cuidado");
    else if (this.listCustomers[this.currentCustomer].listAction.length == 0)
      this.toastr.warning(
        "No hay ningun producto o paquete seleccionado",
        "Cuidado"
      );
    else if (this.selectedWarehouse == "")
      this.toastr.warning("Seleccione un almacen", "Cuidado");
  }

  generateItems() {
    var body = [];
    for (
      let i = 0;
      i < this.listCustomers[this.currentCustomer].listAction.length;
      i++
    ) {
      if (
        this.listCustomers[this.currentCustomer].listAction[i].Paquete == ""
      ) {
        body.push({
          margin: [8, 0],
          columns: [
            {
              text:
                this.listCustomers[this.currentCustomer].listAction[i]
                  .Cantidad +
                this.listCustomers[this.currentCustomer].listAction[i].Unidad +
                " de " +
                this.listCustomers[this.currentCustomer].listAction[i]
                  .Producto +
                "\n",
              alignment: "left",
              fontSize: 6
            },
            {
              text:
                this.listCustomers[this.currentCustomer].listAction[i].Moneda +
                " " +
                this.listCustomers[this.currentCustomer].listAction[i].price +
                "\n",
              alignment: "right",
              fontSize: 6
            }
          ]
        });
      } else
        body.push({
          margin: [8, 0],
          columns: [
            {
              text:
                this.listCustomers[this.currentCustomer].listAction[i]
                  .Cantidad +
                " paquete " +
                this.listCustomers[this.currentCustomer].listAction[i].Paquete +
                "\n",
              alignment: "left",
              fontSize: 6
            },
            {
              text:
                this.listCustomers[this.currentCustomer].listAction[i].Moneda +
                " " +
                this.listCustomers[this.currentCustomer].listAction[i].price +
                "\n",
              alignment: "right",
              fontSize: 6
            }
          ]
        });
    }
    return body;
  }

  generatePDF() {
    let date = this.currentDate();
    var saleTicket = {
      content: [
        { text: "Meraki Solutions\n\n", alignment: "center", fontSize: 10 },
        {
          image:
            "data:image/png;base64,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",
          width: 70,
          alignment: "center"
        },
        { text: "\n" },
        { text: "Arequipa, Peru\n\n", alignment: "center", fontSize: 8 },
        { text: "RUC : 10720746374\n\n", alignment: "center", fontSize: 7 },
        { text: "N° de serie : 626323 \n\n", alignment: "center", fontSize: 7 },
        {
          text:
            "Fecha: " +
            date.getDay() +
            "/" +
            (date.getMonth() + 1) +
            "/" +
            date.getFullYear() +
            "\n",
          alignment: "left",
          fontSize: 6,
          margin: [5, 0]
        },
        {
          text:
            "Hora: " +
            date.getHours() +
            ":" +
            date.getMinutes() +
            ":" +
            date.getSeconds() +
            "\n",
          alignment: "left",
          fontSize: 6,
          margin: [5, 0]
        },
        {
          text:
            "Cliente: " +
            this.listCustomers[this.currentCustomer].client.Nombre +
            "\n\n",
          alignment: "left",
          fontSize: 6,
          margin: [5, 0]
        },
        {
          text: "Productos: \n",
          alignment: "left",
          fontSize: 6,
          margin: [5, 0]
        },
        this.generateItems(),
        {
          text:
            "\nTotal: " + this.listCustomers[this.currentCustomer].total + "\n",
          alignment: "center",
          fontSize: 6
        },
        { text: "\nTicket de venta", alignment: "center", fontSize: 6 }
      ],
      pageSize: {
        width: 104.88,
        height: "auto"
      },
      pageMargins: [2, 5, 0, 0],
      styles: {
        header: {
          fontSize: 6,
          margin: [0, 0, 0, 0]
        }
      }
    };
    pdfMake.createPdf(saleTicket).download("Boleta");
    try {
      pdfMake.createPdf(saleTicket).print();
    } catch (e) {
      this.isLoadingResults = false;
      this.toastr.error(
        "Ha bloqueado las ventas emergentes en el navegador, activelas para esta pagina para poder funcionar al 100%",
        "Error"
      );
      return false;
    }
    return true;
  }

  hideProductsChange() {
    this.hideProducts = !this.hideProducts;
  }

  currentDate() {
    const currentDate = new Date();

    if (31 < 31) {
      if (31 + 1 < 10) {
        if (currentDate.getMonth() + 1 < 10) {
          var limite =
            currentDate.getFullYear() +
            "-0" +
            (currentDate.getMonth() + 1) +
            "-0" +
            (31 + 1) % 31;
        } else {
          var limite =
            currentDate.getFullYear() +
            "-" +
            (currentDate.getMonth() + 1) +
            "-0" +
            (31 + 1) % 31;
        }
      } else {
        if (currentDate.getMonth() + 1 < 10) {
          var limite =
            currentDate.getFullYear() +
            "-0" +
            (currentDate.getMonth() + 1) +
            "-" +
            (31 + 1) % 31;
        } else {
          var limite =
            currentDate.getFullYear() +
            "-" +
            (currentDate.getMonth() + 1) +
            "-" +
            (31 + 1) % 31;
        }
      }
    } else {
      if (currentDate.getMonth() + 1 < 12) {
        if ((currentDate.getMonth() + 2) % 13 + 1 < 10) {
          var limite =
            currentDate.getFullYear() +
            "-0" +
            ((currentDate.getMonth() + 2) % 13 + 1) +
            "-0" +
            1;
        } else {
          var limite =
            currentDate.getFullYear() +
            "-" +
            ((currentDate.getMonth() + 2) % 13 + 1) +
            "-0" +
            1;
        }
      } else {
        if ((currentDate.getMonth() + 2) % 13 + 1 < 10) {
          var limite =
            currentDate.getFullYear() +
            1 +
            "-0" +
            ((currentDate.getMonth() + 2) % 13 + 1) +
            "-0" +
            1;
        } else {
          var limite =
            currentDate.getFullYear() +
            1 +
            "-" +
            ((currentDate.getMonth() + 2) % 13 + 1) +
            "-0" +
            1;
        }
      }
    }

    return currentDate;
  }

  getAllProducts(alm: string) {
    this.posService
      .getProducts(this.bd)
      .pipe(takeWhile(() => this.alive))
      .subscribe(res => {
        this.productos = res.records;
        this.productos.sort(this.sortBy("Nombre"));
        this.posService
          .getPackages(this.bd)
          .pipe(takeWhile(() => this.alive))
          .subscribe(res => {
            this.isLoadingResults = false;
            this.paquetes = res.records;
            this.cd.markForCheck();
            this.filtrarProductos(alm);
          });
      });
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
