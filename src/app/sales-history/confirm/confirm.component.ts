import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {

  constructor(
    public DialogRef : MatDialogRef<ConfirmComponent>,
  ) { }

  ngOnInit() {
  }

  onNoClick(){
    this.DialogRef.close('close');
  }

  onSubmit(){
    this.DialogRef.close('true');
  }

}
