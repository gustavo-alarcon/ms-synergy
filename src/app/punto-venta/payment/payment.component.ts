import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef, MatDialog } from '@angular/material';
import { InventariosService } from '../../servicios/almacenes/inventarios.service';


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
  documentos: any[] = [];
  numerosSerie: any[] [];
  selectedDocument : any = '';
  serieSeleccionado : any = '';
  correlativo : any = '';
  inputCorrelativo:boolean = true;

  constructor(
    public DialogRef : MatDialogRef<PaymentComponent>,
    private inventariosService : InventariosService,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) { 
    this.customer = data;

    this.inventariosService.currentDataDocumentos.subscribe(res => {  
      let _serie = '';
      this.numerosSerie = [];
      res.forEach(element => {
        if(element.Naturaleza== 'SALIDA'){
          this.documentos.push(element);
          if (element['Numtienda'] != _serie && this.numerosSerie.indexOf(element['Numtienda']) < 0) {
            this.numerosSerie.push(element['Numtienda']);
            _serie = element['Numtienda'];
          }
        }
      });
    });

  }

  ngOnInit() {
    
  }
  
  changeDocument(){
    this.correlativo = this.selectedDocument.Correlativo_actual;
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
    return (this.entregado < this.customer.total || this.paymentType == '' || this.selectedDocument == '' || this.serieSeleccionado == '');
  }

  confirmSale(){
    this.DialogRef.close(true);
  }
}
