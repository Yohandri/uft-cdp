import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-active',
  templateUrl: './active.component.html',
  styleUrls: ['./active.component.scss']
})
export class ActiveComponent implements OnInit {
  guid = '';
  newPassword = '';
  newPasswordRepeat = '';
  isForgetPassword = false;
  load = false;
  constructor(
    public system: SystemService,
    public router: Router
    ) { }

  ngOnInit(): void {
    if (this.router.url.split('/')[1] === 'r') {
      this.isForgetPassword = true;
    }
    this.guid = this.router.url.split('/')[2];
    console.log(this.guid);
    if (!this.isForgetPassword) {
      this.confirmcode();
    }
  }
  async confirmcode() {
    console.log(this.guid);
    const body = {code: this.guid, password: this.newPassword, isActive: !this.isForgetPassword}
    const res = await this.system.register(body, true);
    if (res) {
      this.load = true;
    }
  }

}
