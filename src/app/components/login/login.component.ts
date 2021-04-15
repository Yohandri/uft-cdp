import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system.service';
export interface FormRegister {
  ci?: string;
  email?: string;
  captcha?: string;
}
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
isRegister = false;
public formRegister: FormRegister = {};
  constructor(
    public system: SystemService
  ) { }

  ngOnInit(): void {
  }
  login() {
    this.system.goto('gp');
  }
  register() {
    this.formRegister = {};
    this.isRegister = true;
  }
  registerCancel() {
    this.isRegister = false;
  }
  registerSubmit() {
    console.log(this.formRegister);
  }

}
