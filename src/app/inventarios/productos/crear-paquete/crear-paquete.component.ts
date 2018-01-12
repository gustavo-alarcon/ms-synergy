import { InventariosService } from './../../../servicios/almacenes/inventarios.service';
import { Component, OnInit } from '@angular/core';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-crear-paquete',
  templateUrl: './crear-paquete.component.html',
  styleUrls: ['./crear-paquete.component.css']
})
export class CrearPaqueteComponent implements OnInit {

  crearPaqueteForm: FormGroup;
  
  productos: any[] = [];
  almacenes: any[] = [];
  productos_filtrado: any[] = [];
  almacenName: string = '';
  pack: string = '';
  items: any[] = [
    {Pack: '', ID_producto: '', Cantidad: 0, PrecioUnitario: 0}
  ];

  constructor(private inventariosService: InventariosService,
              private snackBar: MatSnackBar,
              private fb: FormBuilder) {}

  ngOnInit() {

    this.inventariosService.currentDataProductos.subscribe(res => {
      this.productos = res;
    });

    this.inventariosService.currentDataAlmacenes.subscribe(res => {
      this.almacenes = res;
    });
  }

  guardarPaquete() {

    this.items.forEach(element => {
      element['Pack'] = this.pack;
      element['Almacen'] = this.almacenName;
    });
    
    if(this.items.length > 0 && this.items[0].ID_producto != ''){
      this.inventariosService.crearPaquete(this.items);
    }else{
      this.snackBar.open('Agregue productos al paquete', 'Cerrar',{
        duration: 10000,
      });
    }
    
  }

  agregarItem() {
    this.items.push({Pack:'',ID_producto:'',Cantidad: 0, PrecioUnitario: 0});
  }

  filtrarProductos(alm: string){
    
    this.productos_filtrado = [];

    this.productos.forEach(element => {
      if(element['Zona'] === alm){
        this.productos_filtrado.push(element);
      }
    });

    this.almacenName = alm;
        
  }

  setProduct(prod: any, idx: any){

    
    this.items[idx]['ID_producto'] = prod.ID;
    this.items[idx]['PrecioUnitario'] = prod.Venta;

  }
}
