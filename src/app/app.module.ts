import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes} from '@angular/router';
import { RoutingModule } from './routing/routing.module';
import {  MatToolbarModule,
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
          MatCheckboxModule,
          MatProgressSpinnerModule,
          MatListModule,
          MatGridListModule,
          MatSlideToggleModule,
          MatTooltipModule,
          MatRadioModule,
          MatSortModule
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
import { PuntoVentaComponent } from './punto-venta/punto-venta.component';
import { ImageUploadModule } from "angular2-image-upload";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { AddClientComponent } from './ms-text/add-client/add-client.component';
import { ContactComponent } from './ms-text/contact/contact.component';
import { InputModalComponent } from './ms-text/input-modal/input-modal.component';
import { MessagesComponent } from './ms-text/messages/messages.component'; 


import { HttpClientModule } from '@angular/common/http';
import { ClientsService } from './servicios/clients.service';
import { MessagesService } from './servicios/messages.service';
import { AuthService } from './servicios/auth.service';
import { ToastrModule } from 'ngx-toastr';
import { Auth2Guard } from './guards/auth2.guard';
import { AuthLoginGuard } from './guards/auth-login.guard';
import { NgIfMediaQuery } from '../angular2-if-media-query-directive';
import { MsTextComponent } from './ms-text/mstext/mstext.component';
import { LazyLoadImageModule } from 'ng2-lazyload-image';
import { ClientsComponent } from './punto-venta/clients/clients.component';
import { PaymentComponent } from './punto-venta/payment/payment.component';
import { AddClient2Component } from './punto-venta/clients/add-client/add-client.component';
import { SalesHistoryComponent } from './sales-history/sales-history.component';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { InlineEditComponent } from './ms-text/inline-edit/inline-edit.component';
import { HistoryComponent } from './ms-text/history/history.component';
import { InlineEditHistoryComponent } from './ms-text/history/inline-edit-history/inline-edit-history.component';
import { PosService } from './servicios/pos.service';

import {MAT_AUTOCOMPLETE_SCROLL_STRATEGY} from '@angular/material'; 
import { Platform } from '@angular/cdk/platform'; 
import { Overlay } from '@angular/cdk/overlay';


export function MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(overlay: Overlay, platform: Platform) { return () => platform.IOS ? overlay.scrollStrategies.block() : overlay.scrollStrategies.reposition(); }

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
    CrearAccountComponent,
    PuntoVentaComponent,
    AddClientComponent,
    ContactComponent,
    InputModalComponent,
    MessagesComponent,
    NgIfMediaQuery,
    MsTextComponent,
    ClientsComponent,
    PaymentComponent,
    AddClient2Component,
    SalesHistoryComponent,
    InlineEditComponent,
    HistoryComponent,
    InlineEditHistoryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
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
    DataTablesModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatListModule,
    ImageUploadModule.forRoot(),
    ToastrModule.forRoot(),
    LazyLoadImageModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatRadioModule,
    SatPopoverModule ,
    MatSortModule
  ],
  entryComponents:[
    InputModalComponent,
    AddClientComponent,
    ClientsComponent,
    PaymentComponent,
    AddClient2Component
  ],
  providers: [
    LoginService,
    InventariosService,
    AuthGuard,
    ClientsService,
    MessagesService,
    AuthService,
    Auth2Guard,
    AuthLoginGuard,
    PosService,
    {
      provide: LocationStrategy, useClass: HashLocationStrategy
    },
    { provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY, 
      deps: [Overlay, Platform],
      useFactory: MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY, }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
