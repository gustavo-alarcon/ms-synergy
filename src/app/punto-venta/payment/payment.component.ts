import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef, MatDialog } from '@angular/material';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  customer : any ;

  constructor(
    public DialogRef : MatDialogRef<PaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) { 
    this.customer = data;
  }

  ngOnInit() {
    
  }
  
  onNoClick(){
    this.DialogRef.close('CLOSE');
  }

}
