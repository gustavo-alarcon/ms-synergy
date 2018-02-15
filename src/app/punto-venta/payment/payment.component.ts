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
  entregado : string = '';
  vuelto : string = '';
  paymentType : any = '';

  constructor(
    public DialogRef : MatDialogRef<PaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) { 
    this.customer = data;

  }

  ngOnInit() {
    
  }
  
  onNoClick(){
    this.DialogRef.close(false);
  }

  addPayment(int){
  if(int == '.'){ 
    for(let x = 0 ; x < this.entregado.length ; x++)
      if(this.entregado[x] == '.'){return;}
  }
    this.entregado = this.entregado+int;
    if(int != '.'){
      this.darVuelto();
    }
  }

  backspace(){
    if(this.entregado == '' ){
      this.vuelto = '';
      return;
    }
    else{
      this.entregado = this.entregado.slice(0, -1);
      if(this.entregado[this.entregado.length-1] != '.'){
        this.darVuelto();
      }
    }
  }

  darVuelto(){
    if(this.entregado > this.customer.total){
      this.vuelto = (parseFloat(this.entregado) - parseFloat(this.customer.total)).toString();
      this.vuelto = parseFloat(this.vuelto).toFixed(2);
    }
    else{
      this.vuelto = '';
    }
  }

  confirm(){
    return (this.entregado < this.customer.total || this.paymentType == '');
  }

  confirmSale(){
    this.DialogRef.close(true);
  }
}
