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
  }
  logout() {
    this.system.message('Hasta luego', 'success');
    localStorage.removeItem('access_token');
    setTimeout(() => {
      location.reload();
    }, 1000);
  }

}
