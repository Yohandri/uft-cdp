import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginModel = {
    username: '',
    password: '',
    branch: ''
}
branchs = [];
isRemenber = false;
  constructor(
    public system: SystemService
  ) { }

  ngOnInit(): void {
  }
  login() {
    this.system.goto('');
  }

}
