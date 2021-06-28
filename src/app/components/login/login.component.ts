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
isConfirm = false;
code_confirm = null;
newPassword = null;
public formRegister: FormRegister = {};
isForgetPassword = false;
correo = '';
  constructor(
    public system: SystemService
  ) { }

  ngOnInit(): void {
    const remember = localStorage.getItem('remember');
    const isRemenber = localStorage.getItem('isRemenber');
    if (remember) {
      const data = JSON.parse(window.atob(remember));
        this.loginModel.username = data.ci;
        this.loginModel.password = data.password;
    }
    if (isRemenber) {
        this.isRemenber = JSON.parse(isRemenber);
    }
  }
  forgetPassword() {
    this.isForgetPassword = true;
    this.formRegister.ci = '';
  }
  async sendForgetPassword() {
    const body = {ci: this.correo};
    const res = await this.system.forgetPassword(body);
    if (res) {
      this.isForgetPassword = false;
      this.isConfirm = true;
    }
  }
  async login() {
    //this.system.goto('gp');
    const body = {ci: this.loginModel.username, password: this.loginModel.password};
    if (this.isRemenber) {
      localStorage.setItem('remember',  window.btoa(JSON.stringify(body)));
      localStorage.setItem('isRemenber', JSON.stringify(this.isRemenber));
  } else {
      localStorage.removeItem('remember');
      localStorage.removeItem('isRemenber');
  }
    const res = await this.system.login(body);
    if (res) {
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  }
  register() {
    this.formRegister = {};
    this.isRegister = true;
  }
  registerCancel() {
    this.isRegister = false;
    this.isConfirm = false;
  }
  async registerSubmit() {
    console.log(this.formRegister);
    const body = {ci: this.formRegister.ci, correo: this.formRegister.email}
    const res = await this.system.register(body);
    if (res) {
      this.isRegister = false;
      this.isConfirm = true;
    }
  }
  async confirmcode() {
    console.log(this.code_confirm);
    if (this.formRegister.ci === '') {
      this.formRegister.ci = this.correo;
    }
    const body = {code: this.code_confirm, password: this.newPassword, ci: this.formRegister.ci}
    const res = await this.system.register(body, true);
    if (res) {
      this.isRegister = false;
      this.isConfirm = false;
      this.code_confirm = '';
      this.newPassword = '';
    }
  }

}
