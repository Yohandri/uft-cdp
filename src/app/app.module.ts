import { BrowserModule, } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
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

export function loadConfig(config: SettingsService) {
  return () => config.load();
}

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

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
    PlanesComponent
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
