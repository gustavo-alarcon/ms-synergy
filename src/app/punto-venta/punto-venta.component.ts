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
import { ENGINE_METHOD_DIGESTS } from "constants";

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
  isLoadingResultsCheck = [];
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
          this.isLoadingResultsCheck.push(false);
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
    this.formSelectNumSeries = this.formBuilder.group({
      numSeriesArray: this.formBuilder.array([])
    });
    this.isLoadingResultsCheck = [];
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
      this.isLoadingResultsCheck.push(false);
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
    this.formSelectNumSeries = this.formBuilder.group({
      numSeriesArray: this.formBuilder.array([])
    });
    this.isLoadingResultsCheck = [];
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
      this.isLoadingResultsCheck.push(false);
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
                  .cantidadMaxima &&
              parseInt(
                this.listCustomers[this.currentCustomer].listAction[i].units +
                  int
              ) <=
                this.listCustomers[this.currentCustomer].listAction[i]
                  .Stock_actual
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
                  this.listCustomers[this.currentCustomer].listAction[i]
                    .unitPrice
                ) *
                parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i].units
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
                    this.listCustomers[this.currentCustomer].listAction[i]
                      .unitPrice
                  ) *
                  parseFloat(
                    this.listCustomers[this.currentCustomer].listAction[i].units
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
            this.isLoadingResultsCheck.splice(i, 1);
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
                        .dsc != "" &&
                      this.listCustomers[this.currentCustomer].listAction[i]
                        .dsc[
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .dsc.length - 1
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
            this.isLoadingResultsCheck.splice(i, 1);
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
                    ].toString() != "."
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
                  if (
                    this.listCustomers[this.currentCustomer].listAction[i].dsc[
                      this.listCustomers[this.currentCustomer].listAction[i].dsc
                        .length - 1
                    ].toString() == "."
                  ) {
                    let dscTmp = JSON.parse(JSON.stringify(this.listCustomers[
                      this.currentCustomer
                    ].listAction[i].dsc.slice(
                      0,-1
                    )));
                    this.listCustomers[this.currentCustomer].listAction[
                      i
                    ].price =
                      ((parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .unitPrice
                      ) *
                      parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .units
                      )) *
                      (100 - parseFloat(dscTmp))) /
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
            this.isLoadingResultsCheck.splice(i, 1);
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
                      .dsc != "" &&
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
                          .unitPrice
                      ) *
                      parseFloat(
                        this.listCustomers[this.currentCustomer].listAction[i]
                          .units
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
                  this.listCustomers[this.currentCustomer].listAction[i]
                    .unitPrice
                ) *
                parseFloat(
                  this.listCustomers[this.currentCustomer].listAction[i].units
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
    this.isLoadingResultsCheck = [];
    let list = crypto.AES.encrypt(JSON.stringify(this.listCustomers), "meraki");
    localStorage.setItem("list", list);
  }

  tabChanged(e) {
    if (e.index == this.listCustomers.length) {
      this.selectedIndex = this.listCustomers.length - 1;
      this.formSelectNumSeries = this.formBuilder.group({
        numSeriesArray: this.formBuilder.array([])
      });
      this.isLoadingResultsCheck = [];
    }
    localStorage.setItem("tab", JSON.stringify(this.selectedIndex));
  }

  addToList(idx) {
    if (this.filteredOptions[idx].Stock_actual <= 0) {
      this.toastr.warning(
        "No hay stock disponible para vender el producto seleccionado",
        "Cuidado"
      );
    } else {
      let i = null;
      for (let j = 0; j < this.productos_filtrado.length; j++) {
        if (
          this.filteredOptions[idx].Codigo == this.productos_filtrado[j].Codigo
        )
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
            Stock_actual: this.productos_filtrado[i].Stock_actual,
            listNumSeries: null,
            seriesSelected: [],
            cantidadMaxima: null
          });
          this.listCustomers[this.currentCustomer].total += +this.listCustomers[
            this.currentCustomer
          ].listAction[
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
          this.cd.markForCheck();
          this.addNumSerie();
          this.isLoadingResultsCheck.push(true);
          this.posService
            .getNumSerie(this.bd, this.productos_filtrado[i].Nombre)
            .pipe(takeWhile(() => this.alive))
            .subscribe(
              data => {
                this.listCustomers[this.currentCustomer].listAction[
                  this.listCustomers[this.currentCustomer].listAction.length - 1
                ].listNumSeries =
                  data.records;
                for (
                  let i = 0;
                  i <
                  this.listCustomers[this.currentCustomer].listAction[
                    this.listCustomers[this.currentCustomer].listAction.length -
                      1
                  ].listNumSeries.length;
                  i++
                ) {
                  if (
                    this.listCustomers[this.currentCustomer].listAction[
                      this.listCustomers[this.currentCustomer].listAction
                        .length - 1
                    ].listNumSeries[i].almacen == this.selectedWarehouse
                  ) {
                    this.listCustomers[this.currentCustomer].listAction[
                      this.listCustomers[this.currentCustomer].listAction
                        .length - 1
                    ].cantidadMaxima++;
                  }
                }
                this.isLoadingResultsCheck[
                  this.listCustomers[this.currentCustomer].listAction.length - 1
                ] = false;
                this.cd.markForCheck();
              },
              err => {
                console.log(err);
                this.isLoadingResultsCheck[
                  this.listCustomers[this.currentCustomer].listAction.length - 1
                ] = false;
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
            Venta: this.pack_nombre[i].Venta,
            Stock_actual: this.productos_filtrado[i].Stock_actual
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
      let list = crypto.AES.encrypt(
        JSON.stringify(this.listCustomers),
        "meraki"
      );
      localStorage.setItem("list", list);
    }
  }

  valueSerie(i) {
    if (
      this.listCustomers[this.currentCustomer].listAction[i].Stock_actual > 0
    ) {
      this.listCustomers[this.currentCustomer].listAction[
        i
      ].units = this.formSelectNumSeries.controls.numSeriesArray.value[
        i
      ].numSeriesSelected.length.toString();
      if (this.verifyValue(i)) {
        this.listCustomers[this.currentCustomer].listAction[i].price =
          parseFloat(
            this.listCustomers[this.currentCustomer].listAction[i].unitPrice
          ) *
          parseFloat(
            this.listCustomers[this.currentCustomer].listAction[i].units
          );
        this.listCustomers[this.currentCustomer].listAction[
          i
        ].price = parseFloat(
          this.listCustomers[this.currentCustomer].listAction[i].price
        ).toFixed(2);
        if (this.listCustomers[this.currentCustomer].listAction[i].dsc != "") {
          this.listCustomers[this.currentCustomer].listAction[i].price =
            parseFloat(
              this.listCustomers[this.currentCustomer].listAction[i].unitPrice
            ) *
            parseFloat(
              this.listCustomers[this.currentCustomer].listAction[i].units
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
      } else this.listCustomers[this.currentCustomer].listAction[i].price = "";
      this.calculateTotalAndTaxes();
    } else {
      let numSeriesForm = this.formSelectNumSeries.get(
        "numSeriesArray"
      ) as FormArray;
      numSeriesForm.controls[i].patchValue({
        numSeriesSelected: []
      });
    }
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
    let dot = false;
    for (
      let i = 0;
      i < this.listCustomers[this.currentCustomer].listAction.length;
      i++
    ) {
      if (this.listCustomers[this.currentCustomer].listAction[i].units == "") {
        hasEmptyProducts = true;
        break;
      }
      if(this.listCustomers[this.currentCustomer].listAction[i].dsc[this.listCustomers[this.currentCustomer].listAction[i].dsc.length-1] == "." || this.listCustomers[this.currentCustomer].listAction[i].unitPrice[this.listCustomers[this.currentCustomer].listAction[i].unitPrice.length-1] == "."){
        dot = true;
      }
    }
    if (
      this.listCustomers[this.currentCustomer].listAction.length != 0 &&
      this.listCustomers[this.currentCustomer].client.Nombre != "Cliente" &&
      hasEmptyProducts == false &&
      dot == false &&
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
    else if (dot == true)
      this.toastr.warning("Tiene productos con punto al final", "Cuidado");
  }

  calculateDsc() {
    var body = [];
    let totalDsc = null;
    for (
      let i = 0;
      i < this.listCustomers[this.currentCustomer].listAction.length;
      i++
    ) {
      if (this.listCustomers[this.currentCustomer].listAction[i].dsc != "") {
        totalDsc =
          parseFloat(
            this.listCustomers[this.currentCustomer].listAction[i].unitPrice
          ) *
          parseFloat(
            this.listCustomers[this.currentCustomer].listAction[i].units
          ) *
          parseFloat(
            this.listCustomers[this.currentCustomer].listAction[i].dsc
          ) /
          100;
        totalDsc = totalDsc.toFixed(2);
      }
    }
    if (totalDsc == null) {
      return {};
    } else {
      return {
        columns: [
          {
            text: "DSCTO X PROMOCION ",
            fontSize: 3,
            alignment: "left",
          },
          {  
            text: totalDsc,
            alignment: "right",
            fontSize: 3, 
            margin: [0, 0, 3,0]
          }
        ]
      };
    }
  }

  table(data) {
    return {
      table: {
        widths: [10, 20, 7, 8, 8, 9],
        headerRows: 1,
        body: this.buildTableBody(data)
      },
      layout: "noBorders"
    };
  }

  buildTableBody(columns) {
    var body = [];
    body.push(columns);
    for (
      let i = 0;
      i < this.listCustomers[this.currentCustomer].listAction.length;
      i++
    ) {
      let dataRow = [];
      if (
        this.listCustomers[this.currentCustomer].listAction[i].Paquete == ""
      ) {
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].id
            .toString()
            .toUpperCase(),
          fontSize: 3
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].Producto,
          fontSize: 3
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].Moneda,
          fontSize: 3
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].Cantidad,
          fontSize: 3
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i]
            .unitPrice,
          fontSize: 3
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].price,
          fontSize: 3
        });
      } else {
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].id
            .toString()
            .toUpperCase()
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].Paquete
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].Moneda
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].Cantidad
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].unitPrice
        });
        dataRow.push({
          text: this.listCustomers[this.currentCustomer].listAction[i].price
        });
      }
      body.push(dataRow);
    }
    return body;
  }

  generatePDF() {
    let date = this.currentDate();
    var saleTicket = {
      content: [
        {
          image:
            "data:image/png;base64,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",
          width: 70,
          alignment: "center"
        },
        {
          text: "\nMeraki Solutions S.A.C - Meraki Solutions\n",
          alignment: "center",
          fontSize: 3,
          lineHeight: 1.2
        },
        {
          text: "RUC: 20602336779 Tlf: 966765624 - 966677277\n",
          alignment: "center",
          fontSize: 3,
          lineHeight: 1.2
        },
        {
          text: "Central: Quinta El Angel 2-A, C. Los Alvarez - Arequipa\n",
          alignment: "center",
          fontSize: 3,
          lineHeight: 1.2
        },
        {
          text: "BOLETA ELECTRÓNICA: B092 - 0952482\n\n",
          alignment: "center",
          fontSize: 3,
          bold: true,
          lineHeight: 1.2
        },
        { text: "Tienda TDA 410 \n", alignment: "left", fontSize: 3 },
        {
          text: "Av. Mariscal Castilla N°528 - Arequipa\n\n",
          alignment: "left",
          fontSize: 3
        },
        {
          text:
            "FECHA DE EMISION: " +
            date.getDay() +
            "/" +
            (date.getMonth() + 1) +
            "/" +
            date.getFullYear() +
            " " +
            date.getHours() +
            ":" +
            date.getMinutes() +
            ":" +
            date.getSeconds() +
            "\n",
          alignment: "left",
          fontSize: 3,
          lineHeight: 1.2
        },
        {
          text: "OPERACION: 461",
          alignment: "left",
          fontSize: 3,
          lineHeight: 1.2
        },
        {
          text: "CAJA/TURNO : 4/2",
          alignment: "left",
          fontSize: 3,
          lineHeight: 1.2
        },
        {
          text:
            "SR(A). " +
            this.listCustomers[this.currentCustomer].client.Nombre +
            "\n\n",
          alignment: "left",
          fontSize: 3,
          lineHeight: 1.2
        },
        this.table([
          { text: "Codigo", fontSize: 3 },
          { text: "Decripcion", fontSize: 3 },
          { text: "Mon.", fontSize: 3 },
          { text: "Cant.", fontSize: 3 },
          { text: "P Unit.", fontSize: 3 },
          { text: "Imp.", fontSize: 3 }
        ]),
        this.calculateDsc(),
        {
          text:"\nTotal: $ " + this.listCustomers[this.currentCustomer].total + "\n",
          alignment: "right",
          fontSize: 3, 
          margin: [0, 0, 3,0],
          lineHeight: 1.2
        },
        {
          columns: [
            {
              text: "Sub-total ",
              fontSize: 3,
              alignment: "left",
              lineHeight: 1.2
            },
            {  
              text: this.listCustomers[this.currentCustomer].subtotal,
              alignment: "right",
              fontSize: 3, 
              margin: [0, 0, 3,0],
              lineHeight: 1.2
            }
          ]
        },
        {
          columns: [
            {
              text: "I.G.V.",
              fontSize: 3,
              alignment: "left",
              lineHeight: 1.2
            },
            {  
              text: this.listCustomers[this.currentCustomer].taxes,
              alignment: "right",
              fontSize: 3, 
              margin: [0, 0, 3,0],
              lineHeight: 1.2
            }
          ]
        },
        {
          columns: [
            {
              text: "Importe total",
              fontSize: 3,
              alignment: "left",
              lineHeight: 1.2
            },
            {  
              text: this.listCustomers[this.currentCustomer].total,
              alignment: "right",
              fontSize: 3, 
              margin: [0, 0, 3,0],
              lineHeight: 1.2
            }
          ]
        },
        { text: "\nSON : SETECIENTOS CUARENTA CON 42/100 SOLES", fontSize: 3 , lineHeight: 1.2},
        { text: "\nTC CREDITO BCP : 340.00", fontSize: 3 , lineHeight: 1.2},
        { text: "\nEFECTIVO 301.00", fontSize: 3 , lineHeight: 1.2 },
        { text: "\nVUELTO: $ 0.60", fontSize: 3 , lineHeight: 1.2 },
        {
          columns: [
            {
              text: "CAJERO: " + this.listCustomers[this.currentCustomer].user,
              fontSize: 3,
              alignment: "left",
              lineHeight: 1.2
            },
            {  
              text: "VENDEDOR: " + this.listCustomers[this.currentCustomer].user,
              alignment: "right",
              fontSize: 3, 
              margin: [0, 0, 3,0],
              lineHeight: 1.2
            }
          ]
        },
        { text: "\nBoleta electronica", alignment: "center", fontSize: 2 , lineHeight: 1.2}
      ],
      pageSize: {
        width: 104.88,
        height: "auto"
      },
      pageMargins: [2, 5, 0, 0],
      styles: {
        header: {
          fontSize: 3,
          margin: [0, 0, 0, 0]
        }
      }
    };
    //pdfMake.createPdf(saleTicket).download("Boleta");
    try {
      pdfMake.createPdf(saleTicket).open();
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
