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
    if (this.system.isAdministrator) {
      this.system.goto('gp/users');
    }
    if (this.system.isStudent) {
      this.system.goto('gp/estudiante');
    }
  }

}
