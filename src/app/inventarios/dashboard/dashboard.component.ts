import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
//import { ChartService } from "../servicios/plot/chart.service";
import * as _ from "lodash";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  //@ViewChild('chart') el:ElementRef;

  constructor() {}

  ngOnInit() {
    //this.basicChart();
  }

  /*basicChart() {
    const element = this.el.nativeElement

    const data  = [{
      x: [1,2,3,4,5],
      y: [1,2,4,8,16]
    }];

    const style = {
      margin: { t:0 }
    };

    Plotly.plot( element, data, style );
  }*/
}
