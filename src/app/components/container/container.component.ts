import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  constructor(
    public system: SystemService
  ) { }

  ngOnInit(): void {
    this.system.getStatus();
    if (this.system.isStudent) {
      this.system.getSaldo();
    }
  }
  logout() {
    this.system.message('Hasta luego', 'success');
    localStorage.removeItem('access_token');
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
  menuClick($event) {
    console.log($event);
    const el = document.getElementById('menuEDC');
    if (el.className.includes('open')) {
      el.className = el.className.replace('open', '');
    } else {
      el.className = el.className + ' open';
    }
  }
  

}
