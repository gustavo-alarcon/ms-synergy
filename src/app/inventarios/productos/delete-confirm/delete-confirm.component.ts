import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-delete-confirm",
  templateUrl: "./delete-confirm.component.html",
  styleUrls: ["./delete-confirm.component.scss"]
})
export class DeleteConfirmComponent implements OnInit {
  constructor(
    public DialogRef: MatDialogRef<DeleteConfirmComponent>,
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
