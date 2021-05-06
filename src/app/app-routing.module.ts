import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContainerComponent } from './components/container/container.component';
import { LoginComponent } from './components/login/login.component';
import { PaymentManagementComponent } from './components/payment-management/payment-management.component';
import { SessionGuard } from './guards/session';
import { LoginGuard } from './guards/login';
import { UsersComponent } from './components/users/users.component';
import { ServicesComponent } from './components/services/services.component';
import { TipoPagoComponent } from './components/tipo-pago/tipo-pago.component';
import { PagosComponent } from './components/pagos/pagos.component';
import { PlanesComponent } from './components/planes/planes.component';

const routes: Routes = [
  {path: 'gp', component: ContainerComponent, canActivate: [SessionGuard],
  children: [
    {path: '', component: PaymentManagementComponent},
    {path: 'users', component: UsersComponent},
    {path: 'services', component: ServicesComponent},
    {path: 'tipopago', component: TipoPagoComponent},
    {path: 'pagos', component: PagosComponent},
    {path: 'planes', component: PlanesComponent}
  ]
  },
  {path: '', component: LoginComponent, canActivate: [LoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
