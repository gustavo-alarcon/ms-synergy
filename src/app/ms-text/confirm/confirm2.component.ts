import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm2.component.html',
  styleUrls: ['./confirm2.component.css']
})
export class Confirm2Component implements OnInit {
  name : string;
  constructor(
    public DialogRef : MatDialogRef<Confirm2Component>,
    @Inject(MAT_DIALOG_DATA) public data : string,
      ) {
        this.name = data;
       }

  ngOnInit() {
  }

  onNoClick(){
    this.DialogRef.close('close');
  }

  onSubmit(){
    this.DialogRef.close('true');
  }

}
