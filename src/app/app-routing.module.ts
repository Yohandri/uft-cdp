import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContainerComponent } from './components/container/container.component';
import { LoginComponent } from './components/login/login.component';
import { PaymentManagementComponent } from './components/payment-management/payment-management.component';
import { AdminGuard, SessionGuard, StudentGuard } from './guards/session';
import { LoginGuard } from './guards/login';
import { UsersComponent } from './components/users/users.component';
import { ServicesComponent } from './components/services/services.component';
import { TipoPagoComponent } from './components/tipo-pago/tipo-pago.component';
import { PagosComponent } from './components/pagos/pagos.component';
import { PlanesComponent } from './components/planes/planes.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EstudiantesComponent } from './components/estudiantes/estudiantes.component';
import { CuentaCarrerasComponent } from './components/cuenta-carreras/cuenta-carreras.component';
import { CuentaServiciosComponent } from './components/cuenta-servicios/cuenta-servicios.component';
import { CuentaIntensivosComponent } from './components/cuenta-intensivos/cuenta-intensivos.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  {path: 'gp', component: ContainerComponent, canActivate: [SessionGuard],
  children: [
    {path: '', component: DashboardComponent},
    {path: 'users', component: UsersComponent, canActivate: [AdminGuard]},
    {path: 'services', component: ServicesComponent, canActivate: [AdminGuard]},
    {path: 'tipopago', component: TipoPagoComponent, canActivate: [AdminGuard]},
    {path: 'pagos', component: PagosComponent, canActivate: [AdminGuard]},
    {path: 'planes', component: PlanesComponent, canActivate: [AdminGuard]},
    {path: 'estudiantes', component: EstudiantesComponent, canActivate: [AdminGuard]},
    {path: 'estudiante', component: PaymentManagementComponent, canActivate: [StudentGuard]},
    {path: 'carreras', component: CuentaCarrerasComponent, canActivate: [StudentGuard]},
    {path: 'servicios', component: CuentaServiciosComponent, canActivate: [StudentGuard]},
    {path: 'intensivos', component: CuentaIntensivosComponent, canActivate: [StudentGuard]},
    {path: 'ajustes', component: SettingsComponent, canActivate: [AdminGuard]},
    {path: 'profile', component: ProfileComponent}
  ]
  },
  {path: '', component: LoginComponent, canActivate: [LoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
