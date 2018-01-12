import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes} from '@angular/router';
import { RoutingModule } from './routing/routing.module';
import {  NoConflictStyleCompatibilityMode,
          MatToolbarModule,
          MatInputModule,
          MatAutocompleteModule,
          MatButtonModule,
          MatCardModule,
          MatMenuModule,
          MatIconModule,
          MatSidenavModule,
          MatTableModule,
          MatPaginatorModule,
          MatDialogModule,
          MatSelectModule,
          MatFormFieldModule,
          MatProgressBarModule,
          MatTabsModule,
          MatExpansionModule,
          MatDatepickerModule,
          MatNativeDateModule,
          MatChipsModule,
          MatSnackBarModule,
          MatCheckboxModule
        } from '@angular/material';

import { AppComponent } from './app.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LandingComponent } from './landing/landing.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { AlmacenesComponent} from './inventarios/almacenes/almacenes.component';
import { DashboardComponent } from './inventarios/dashboard/dashboard.component';

import { LoginService} from './servicios/login/login.service';
import { AuthGuard } from './guards/auth.guard';
import { InventariosService } from './servicios/almacenes/inventarios.service';
import { SidenavComponent } from './inventarios/sidenav/sidenav.component';
import { InventariosComponent } from './inventarios/inventarios/inventarios.component';
import { TercerosComponent} from './inventarios/terceros/terceros.component';
import { DocumentosComponent } from './inventarios/documentos/documentos.component';
import { GruposComponent } from './inventarios/grupos/grupos.component';
import { ProductosComponent } from './inventarios/productos/productos.component';
import { MovimientosComponent } from './inventarios/movimientos/movimientos.component';
import { KardexComponent } from './inventarios/kardex/kardex.component';
import { StockComponent } from './inventarios/stock/stock.component';
import { CrearAlmacenComponent } from './inventarios/almacenes/crear-almacen/crear-almacen.component';
import { CrearTerceroComponent } from './inventarios/terceros/crear-tercero/crear-tercero.component';
import { CrearDocumentoComponent } from './inventarios/documentos/crear-documento/crear-documento.component';
import { CrearGrupoComponent } from './inventarios/grupos/crear-grupo/crear-grupo.component';
import { CrearProductoComponent } from './inventarios/productos/crear-producto/crear-producto.component';
import { CrearPaqueteComponent } from './inventarios/productos/crear-paquete/crear-paquete.component';
import { ReportemovComponent } from './inventarios/reportemov/reportemov.component';

import { DataTablesModule } from 'angular-datatables';
import { ConfigAccountComponent } from './general/config-account/config-account.component';
import { CrearAccountComponent } from './general/config-account/crear-account/crear-account.component';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    LandingComponent,
    WelcomeComponent,
    LoginComponent,
    AlmacenesComponent,
    SidenavComponent,
    DashboardComponent,
    InventariosComponent,
    TercerosComponent,
    DocumentosComponent,
    GruposComponent,
    ProductosComponent,
    MovimientosComponent,
    KardexComponent,
    StockComponent,
    CrearAlmacenComponent,
    CrearTerceroComponent,
    CrearDocumentoComponent,
    CrearGrupoComponent,
    CrearProductoComponent,
    CrearPaqueteComponent,
    ReportemovComponent,
    ConfigAccountComponent,
    CrearAccountComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    NoConflictStyleCompatibilityMode,
    MatToolbarModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatSidenavModule,
    RoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatTabsModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatSnackBarModule,
    MatCheckboxModule,
    DataTablesModule
    
  ],
  providers: [LoginService,InventariosService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
