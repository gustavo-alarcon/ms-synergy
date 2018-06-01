import { Component, OnInit, Inject, ChangeDetectorRef } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { InventariosService } from "../../../servicios/almacenes/inventarios.service";
import { takeWhile } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-delete-confirm",
  templateUrl: "./delete-confirm.component.html",
  styleUrls: ["./delete-confirm.component.scss"]
})
export class DeleteConfirmComponent implements OnInit {
  constructor(
    public DialogRef: MatDialogRef<DeleteConfirmComponent>,
    private inventariosService: InventariosService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  onSubmit() {
    this.DialogRef.close("true");
  }

  onNoClick() {
    this.DialogRef.close("false");
  }
}
