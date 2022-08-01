import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    public system: SystemService
  ) { }

  ngOnInit(): void {
    if (this.system.showIn(true, 'Administrador', 'Administracion')) {
      this.system.goto('gp/facturas');
    }
    if (this.system.showIn(true, 'Caja')) {
      this.system.goto('gp/estudiantes');
    }
    if (this.system.isStudent) {
      this.system.goto('gp/estudiante');
    }
  }

}
