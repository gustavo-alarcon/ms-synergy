import { Component, OnInit } from '@angular/core';
import { InventariosService } from '../servicios/almacenes/inventarios.service';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.css']
})
export class PuntoVentaComponent implements OnInit {
  
  clicked = false;
  almacenes: any[] = [];
  productos_filtrado: any[] = [];
  pack_nombre: any[] = [];
  productos: any[] = [];
  paquetes_filtrado : any[] = [];
  paquetes : any [] = [];
  filteredOptions: string[];
  movimientoForm: FormGroup;
  filteredPackages: string[];
  tabNumber : number = 1;
  selectedWarehouse : string='';
  productsOrPackages : number = 0;
  optionDisplay : number = 1 ;
  disabledToogle = false;
  listCustomers : ListCustomers[]=[];
  currentCustomer : number = 0;
  lastItemClicked : number = null;
  changeItemClicked : number = null;
  checked : boolean;

  constructor(
    private inventariosService : InventariosService,
    private fb: FormBuilder
  ) { 

    this.listCustomers.push({
      listAction : [],
      total : 0,
      taxes : 0,
      lastItemClicked : null
    });

    this.movimientoForm = this.fb.group({
      Producto: '',
      Paquete: '',
    });
    this.inventariosService.currentDataAlmacenes.subscribe(res => {
      this.almacenes = res;
      this.almacenes.sort(this.sortBy('Nombre'));
    });

    this.inventariosService.currentDataProductos.subscribe(res => {
      this.productos = res;
      this.productos.sort(this.sortBy('Nombre'));
    });

    this.inventariosService.currentDataPaquetes.subscribe(res => {
      this.paquetes = res;

    });
  }

  ngOnInit() {
  }

  onTabClick(e){
    this.productsOrPackages = e.index;
    if(e.index==1){
      this.disabledToogle = !this.disabledToogle;
      this.checked = false;
      this.optionDisplay = 1;
    }
    else
    this.disabledToogle = !this.disabledToogle;
  }
  
  onSelectCustomer(e){
    if(e.index != this.listCustomers.length)
      this.currentCustomer = e.index;
    else{
      this.addCustomer();
    }
  }

  clickProductList(i){
    if(this.lastItemClicked == null){
      this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[i].id;
    }
    else{
      this.listCustomers[this.currentCustomer].lastItemClicked = this.listCustomers[this.currentCustomer].listAction[i].id;
    }
  }

  sortBy(key) {
    return function(a , b) {
      if (a[key] > b[key]){
        return 1;
      }else if ( a[key] < b[key]){
        return -1;
      }[]
      return 0;
    }
  }

  slideToogleChange(e){
    if(e.checked){
      this.optionDisplay = 2;
      this.checked = true;
    }
    else{
      this.optionDisplay = 1;
      this.checked = false;
    }
  }

  filtrarProductos(alm: string){
    
    this.productos_filtrado = [];

    this.productos.forEach(element => {
      if(element['Zona'] === alm){
        this.productos_filtrado.push(element);
      }
    });

    this.paquetes.forEach(element => {
      if(element['Almacen'] === alm){
        this.paquetes_filtrado.push(element);
      }
    });

    let _nombre = '';
    let _position = 0;
    this.pack_nombre = [];
    for(let i=0; i<this.paquetes_filtrado.length ; i++){
      if(this.paquetes_filtrado[i].Paquete != _nombre){
        this.pack_nombre.push({
          'Nombre' : this.paquetes_filtrado[i].Paquete,
          'Venta' : this.paquetes_filtrado[i].Venta * this.paquetes_filtrado[i].Cantidad     
        });
        _nombre = this.paquetes_filtrado[i].Paquete;
        _position = this.pack_nombre.length-1;
      }
      else{
        this.pack_nombre[_position].Venta = parseFloat(this.pack_nombre[_position].Venta) + parseFloat(this.paquetes_filtrado[i].Venta);
      }
    }
    console.log(this.productos_filtrado);
    console.log(this.paquetes_filtrado);
    this.filteredOptions = this.productos_filtrado;
    this.filteredPackages = this.pack_nombre;
  }

  pushKeyProducts(){
    this.filteredOptions = this.filterProducto(this.movimientoForm.value['Producto']);
  }

  pushKeyPackage(){
    this.filteredPackages = this.filterPackage(this.movimientoForm.value['Paquete']);
  }

  filterProducto(val): string[] {
    if(this.optionDisplay==1){
      return this.productos_filtrado.filter(option =>
        option.Nombre.toLowerCase().indexOf(val.toLowerCase()) === 0);  
    }
    else{
      return this.productos_filtrado.filter(option =>
        option.Codigo.toLowerCase().indexOf(val.toLowerCase()) === 0);  
    }
  }

  filterPackage(val): string[] {
    return this.pack_nombre.filter(option =>
      option.Nombre.toLowerCase().indexOf(val.toLowerCase()) === 0);  
  }

  addCustomer(){
    this.listCustomers.push({
      listAction : [],
      total : 0,
      taxes : 0,
      lastItemClicked : null
    });
    this.currentCustomer = this.listCustomers.length-1;
  }

  addToList(i){
    //Trabajo con productos
    if(this.productsOrPackages == 0){
      this.listCustomers[this.currentCustomer].listAction.push({
        price : this.productos_filtrado[i].Venta,
        product : this.productos_filtrado[i].Nombre,
        units : 1,
        id : this.productos_filtrado[i].ID
      });
      this.listCustomers[this.currentCustomer].total += +(this.listCustomers[this.currentCustomer].listAction[this.listCustomers[this.currentCustomer].listAction.length-1].price);
      this.listCustomers[this.currentCustomer].taxes = (this.listCustomers[this.currentCustomer].total*17)/100;
      this.lastItemClicked = this.productos_filtrado[i].ID;
    }
    //Trabajo con paquetes
    else{
      this.listCustomers[this.currentCustomer].listAction.push({
        price : this.pack_nombre[i].Venta,
        product : this.pack_nombre[i].Nombre,
        units : 1,
        id : this.pack_nombre[i].Nombre
      });
      this.listCustomers[this.currentCustomer].total += +(this.listCustomers[this.currentCustomer].listAction[this.listCustomers[this.currentCustomer].listAction.length-1].price);
      this.listCustomers[this.currentCustomer].taxes = (this.listCustomers[this.currentCustomer].total*18)/100;
      this.lastItemClicked = this.pack_nombre[i].Nombre;

    }
  }

}

interface ListCustomers {
  listAction : ListAction[];
  total: number;
  taxes : number;
  lastItemClicked  : any;
}

interface ListAction {
  product : string;
  price : number;
  units : number;
  id : number;
}