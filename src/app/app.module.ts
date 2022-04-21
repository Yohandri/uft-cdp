import { BrowserModule, } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ContainerComponent } from './components/container/container.component';
import { FormsModule } from '@angular/forms';
import { PaymentManagementComponent } from './components/payment-management/payment-management.component';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { UsersComponent } from './components/users/users.component';
import { SystemService } from './services/system.service';
import { SettingsService } from './services/config.service';
import { JwtModule } from '@auth0/angular-jwt';
import { ServicesComponent } from './components/services/services.component';
import { TipoPagoComponent } from './components/tipo-pago/tipo-pago.component';
import { PagosComponent } from './components/pagos/pagos.component';
import { PlanesComponent } from './components/planes/planes.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { EstudiantesComponent } from './components/estudiantes/estudiantes.component';
import { CuentaCarrerasComponent } from './components/cuenta-carreras/cuenta-carreras.component';
import { CuentaServiciosComponent } from './components/cuenta-servicios/cuenta-servicios.component';
import { CuentaIntensivosComponent } from './components/cuenta-intensivos/cuenta-intensivos.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { SettingsComponent } from './components/settings/settings.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { CuotasComponent } from './components/cuotas/cuotas.component';
import { CuotasServiciosComponent } from './components/cuotas-servicios/cuotas-servicios.component';
import { ActiveComponent } from './components/login/active/active.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FacturasComponent } from './components/facturas/facturas.component';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { LibroVentaComponent } from './components/libro-venta/libro-venta.component';
// import localeVe from '@angular/common/locales/es-VE';
// import { registerLocaleData } from '@angular/common';
export function loadConfig(config: SettingsService) {
  return () => config.load();
}

export function tokenGetter() {
  return localStorage.getItem('access_token');
}
//registerLocaleData(localeVe);
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ContainerComponent,
    PaymentManagementComponent,
    UsersComponent,
    ServicesComponent,
    TipoPagoComponent,
    PagosComponent,
    PlanesComponent,
    ProfileComponent,
    DashboardComponent,
    EstudiantesComponent,
    CuentaCarrerasComponent,
    CuentaServiciosComponent,
    CuentaIntensivosComponent,
    SettingsComponent,
    CuotasComponent,
    CuotasServiciosComponent,
    ActiveComponent,
    FacturasComponent,
    LibroVentaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    HttpClientModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    NzIconModule,
    NzMessageModule,
    CurrencyMaskModule,
    NzButtonModule,
    NzUploadModule,
    NzPopoverModule,
    NzRadioModule,
    NzToolTipModule,
    NzAutocompleteModule,
    JwtModule.forRoot({
      config: {
        tokenGetter
      }
    })
  ],
  providers: [
    SystemService,
    SettingsService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: loadConfig,
      deps: [SettingsService]
    },
    // {
    //   provide: LOCALE_ID,
    //   useValue: 'es-VE' // 'de-DE' for Germany, 'fr-FR' for France ...
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
