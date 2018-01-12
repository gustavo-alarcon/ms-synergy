import { ConfigAccountComponent } from './../general/config-account/config-account.component';
import { ReportemovComponent } from './../inventarios/reportemov/reportemov.component';
import { CrearPaqueteComponent } from './../inventarios/productos/crear-paquete/crear-paquete.component';
import { CrearProductoComponent } from './../inventarios/productos/crear-producto/crear-producto.component';
import { CrearGrupoComponent } from './../inventarios/grupos/crear-grupo/crear-grupo.component';
import { CrearDocumentoComponent } from './../inventarios/documentos/crear-documento/crear-documento.component';
import { CrearAlmacenComponent } from './../inventarios/almacenes/crear-almacen/crear-almacen.component';
import { StockComponent } from './../inventarios/stock/stock.component';
import { KardexComponent } from './../inventarios/kardex/kardex.component';
import { MovimientosComponent } from './../inventarios/movimientos/movimientos.component';
import { ProductosComponent } from './../inventarios/productos/productos.component';
import { GruposComponent } from './../inventarios/grupos/grupos.component';
import { DocumentosComponent } from './../inventarios/documentos/documentos.component';

import { NgModule }              from '@angular/core';
import { RouterModule, Routes}  from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
 
import { AppComponent } from '../app.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { LandingComponent } from '../landing/landing.component';
import { WelcomeComponent } from '../welcome/welcome.component';
import { LoginComponent } from '../login/login.component';
import { InventariosComponent } from './../inventarios/inventarios/inventarios.component';
import { AlmacenesComponent } from '../inventarios/almacenes/almacenes.component';
import { SidenavComponent } from '../inventarios/sidenav/sidenav.component';
import { DashboardComponent } from './../inventarios/dashboard/dashboard.component';
import { TercerosComponent } from './../inventarios/terceros/terceros.component';
import { CrearTerceroComponent } from "./../inventarios/terceros/crear-tercero/crear-tercero.component";
import { CrearAccountComponent } from '../general/config-account/crear-account/crear-account.component';


const appRoutes: Routes = [
    { path: 'welcome', component: WelcomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'landing', canActivate: [AuthGuard], component: LandingComponent},
    { path: 'config', canActivate: [AuthGuard], component: ConfigAccountComponent,
      children: [
        { path: 'crear-account', component: CrearAccountComponent },
      ]
    },
    { path: 'inventarios', canActivate: [AuthGuard], component: InventariosComponent,
      children: [
        { path: '', component: DashboardComponent },
        { path: 'dashboard', component: DashboardComponent },
        { path: 'almacenes', component: AlmacenesComponent,
          children: [
            { path: 'crear-almacen', component: CrearAlmacenComponent }
          ] },
        { path: 'terceros', component: TercerosComponent,
          children: [
            { path: 'crear-tercero', component: CrearTerceroComponent }
          ] },
        { path: 'documentos', component: DocumentosComponent,
        children: [
            { path: 'crear-documento', component: CrearDocumentoComponent }
          ] },
        { path: 'grupos', component: GruposComponent,
          children: [
              { path: 'crear-grupo', component: CrearGrupoComponent }
            ] },
        { path: 'productos', component: ProductosComponent,
          children: [
              { path: 'crear-producto', component: CrearProductoComponent },
              { path: 'crear-paquete', component: CrearPaqueteComponent }
            ] },
        { path: 'movimientos', component: MovimientosComponent },
        { path: 'kardex', component: KardexComponent },
        { path: 'stock', component: StockComponent },
        { path: 'reportemov', component: ReportemovComponent },
      ] },
    { path: '', component: WelcomeComponent },
    { path: '**', component: WelcomeComponent }
  ];
 
@NgModule({
  imports: [
    RouterModule.forRoot( appRoutes )
  ],
  exports: [
    RouterModule
  ]
})
export class RoutingModule {}