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
import { PuntoVentaComponent } from '../punto-venta/punto-venta.component';
import { Auth2Guard } from '../guards/auth2.guard';
import { AuthLoginGuard } from '../guards/auth-login.guard';
import { MsTextComponent } from '../ms-text/mstext/mstext.component';
import { SalesHistoryComponent } from '../sales-history/sales-history.component';

const appRoutes: Routes = [
    { path: 'welcome', component: WelcomeComponent, data: { animation: 'welcome', depth: 1 }},
    { path: 'login', component: LoginComponent, data: { animation: 'login', depth: 2 } },
    { path: 'landing',canActivate: [AuthGuard], component: LandingComponent, data: { animation: 'landing', depth: 3 }},
    { path: 'config', canActivate: [AuthGuard], component: ConfigAccountComponent, data: { animation: 'config', depth: 4 },
      children: [
        { path: 'crear-account', component: CrearAccountComponent , data: { animation: 'crear-account', depth: 5 }},
      ]
    },
    { path: 'inventarios',canActivate: [AuthGuard], component: InventariosComponent, data: { animation: 'inventarios', depth: 4 },
      children: [
        { path: '', component: DashboardComponent , data: { animation: 'init', depth: 5 }},
        { path: 'dashboard', component: DashboardComponent , data: { animation: 'dashboard', depth: 5 }},
        { path: 'almacenes', component: AlmacenesComponent, data: { animation: 'almacenes', depth: 5 },
          children: [
            { path: 'crear-almacen', component: CrearAlmacenComponent, data: { animation: 'crear-almacen', depth: 5 } }
          ] },
        { path: 'terceros', component: TercerosComponent, data: { animation: 'terceros' , depth: 5},
          children: [
            { path: 'crear-tercero', component: CrearTerceroComponent , data: { animation: 'crear-terceros', depth: 5}}
          ] },
        { path: 'documentos', component: DocumentosComponent, data: { animation: 'documentos' , depth: 5},
        children: [
            { path: 'crear-documento', component: CrearDocumentoComponent , data: { animation: 'crear-documentos' , depth: 5}}
          ] },
        { path: 'grupos', component: GruposComponent, data: { animation: 'grupos' , depth: 5},
          children: [
              { path: 'crear-grupo', component: CrearGrupoComponent , data: { animation: 'crear-grupos', depth: 5 }}
            ] },
        { path: 'productos', component: ProductosComponent, data: { animation: 'productos', depth: 5 },
          children: [
              { path: 'crear-producto', component: CrearProductoComponent, data: { animation: 'crear-producto', depth: 5 } },
              { path: 'crear-paquete', component: CrearPaqueteComponent, data: { animation: 'crear-paquete', depth: 5 } }
            ] },
        { path: 'movimientos', component: MovimientosComponent, data: { animation: 'movimientos', depth: 5 } },
        { path: 'kardex', component: KardexComponent, data: { animation: 'kardex' , depth: 5} },
        { path: 'stock', component: StockComponent , data: { animation: 'stock' , depth: 5}},
        { path: 'reportemov', component: ReportemovComponent, data: { animation: 'reportemov', depth: 5 } },
      ] },
    { path: 'puntoVenta', component: PuntoVentaComponent, data: { animation: 'puntoVenta' , depth: 4}}, 
    { path: 'historialVentas', component: SalesHistoryComponent, data: { animation: 'historialVentas' , depth: 4}}, 
    { path: 'ms-text',component: MsTextComponent, data: { animation: 'ms-text', depth: 4}},
    { path: '', component: WelcomeComponent , data: { animation: 'primera' , depth: 1}},
    { path: '**', component: WelcomeComponent, data: { animation: 'random' , depth: 1} }
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