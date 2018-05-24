import { Component, OnInit, Inject, ViewChild, OnDestroy } from "@angular/core";
import { MatDialogRef, MatDialog, MatDatepicker } from "@angular/material";
import { MAT_DIALOG_DATA } from "@angular/material";
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from "@angular/material/core";
import { MessagesService } from "../../servicios/messages.service";
import { FormControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import * as _moment from "moment";
import * as _rollupMoment from "moment";
import * as crypto from "crypto-js";
import { takeWhile } from "rxjs/operators";
const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: "l"
  },
  display: {
    dateInput: "l",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "l",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@Component({
  selector: "app-input-modal",
  templateUrl: "./input-modal.component.html",
  styleUrls: ["./input-modal.component.css"],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class InputModalComponent implements OnInit {
  isLoadingResults: boolean = false;
  date = new FormControl(moment().format("YYYY-MM-DD"));
  horas: number[] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24
  ];
  minDate = new Date();
  completeData = {
    message: "",
    time: null,
    date: "",
    customers: null,
    web: ""
  };
  webBytes = crypto.AES.decrypt(localStorage.getItem("web"), "meraki");
  web = this.webBytes.toString(crypto.enc.Utf8);
  private alive: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<InputModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    public messageService: MessagesService,
    private toastr: ToastrService
  ) {
    this.completeData.customers = data;
  }

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  sendMessages() {
    this.completeData.web = JSON.parse(this.web);
    this.isLoadingResults = true;
    let hour = new Date().getHours();
    let min = new Date().getMinutes();
    let today = moment().format("YYYY-MM-DD");
    if (this.completeData.message == "") {
      this.toastr.error("Tiene que llenar por lo menos el mensaje", "Error");
      this.isLoadingResults = false;
    } else {
      if (this.date.invalid) {
        this.toastr.error(
          "Tiene que escoger una fecha valida superior o igual a la actual",
          "Error"
        );
        this.isLoadingResults = false;
      } else {
        if (this.completeData.time == null) {
          this.completeData.time = 10;
        }
        this.completeData.date = moment(this.date.value).format("YYYY-MM-DD");
        if (
          hour >= this.completeData.time &&
          min > 0 &&
          this.completeData.date == today
        ) {
          this.toastr.error(
            "No puede ser una hora del dia que ya paso",
            "Error"
          );
          this.isLoadingResults = false;
        } else {
          this.completeData.time = String(this.completeData.time) + ":00:00";
          this.messageService
            .sendMessages(this.completeData)
            .pipe(takeWhile(() => this.alive))
            .subscribe(data => {
              this.completeData = {
                message: "",
                time: null,
                date: "",
                customers: null,
                web: ""
              };
              this.isLoadingResults = false;
              this.dialogRef.close(true);
            });
        }
      }
    }
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.alive = false;
  }
}
