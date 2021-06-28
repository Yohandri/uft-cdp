import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  ready = false;
  constructor(
    public system: SystemService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.system.module.name = 'Perfil';
    this.system.module.icon = 'user';
    this.ready = true;
  }

  ngOnDestroy() {
    this.system.module.name = '';
}

  get data() {
    return this.system.decodedToken;
}
}
