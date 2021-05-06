import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import jwtDecode  from 'jwt-decode';
import { SettingsService } from './config.service';
@Injectable({
  providedIn: 'root'
})
export class SystemService {
  sidebarOn = false;
  private _decodedToken;
  module = {name: '', type: '', icon: ''};
  settings: any;
  endpoint: any;
  private headers: HttpHeaders = new HttpHeaders();
  loading = false;
  constructor(
    public router: Router,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public settingsService: SettingsService
  ) {
    // this.getFile({resource: 'assets/appsettings.json'}).then(((res) => {
    //         try {
    //             if (res) {
    //                 this.settings = JSON.parse(res) as any;
    //                 this.endpoint = this.settings.InertiaApiUrl;
    //                 console.log(this.endpoint);
    //             }
    //         }  catch (ex) {
    //             return ex;
    //         } finally {
    //         }
    //     }).bind(this));
  }

  message(str = '', classname = 'info', time = 3000) {
    this.snackBar.open(str, null, {
        duration: time,
        panelClass: [classname]
    });
}

  goto(path, details: any = {}) {
    this.router.navigate([path]);
    if (details.closeSidebar && this.isMobile) {
        this.sidebarOn = false;
        
    }
    const isOpen = document.body.classList.value.includes("menu-open");
    if (isOpen) {
        this.btnToggleSidebar();
    }
}
btnToggleSidebar() {
  const isOpen = document.body.classList.value.includes("menu-open");
  //console.log('btnToggleSidebar', document.body.classList);
  //console.log('isOpen', isOpen);
  if (isOpen) {
      document.body.classList.remove('menu-open');
      // document.getElementById('btnToggleSidebar').classList.remove('openMenu');
  } else {
      document.body.classList.add('menu-open');
      // document.getElementById('btnToggleSidebar').classList.add('openMenu');
  }
  
}
//LOGIN
async login(body) {
  this.loading = true;
  return this.http.post(this.settingsService.Settings.endpoint + 'api/login', body, {headers: this.headers}).toPromise().then((res: any) => {
    this.loading = false;
    if (res.status === 200) {
      this.message(res.message, 'success');
      this.setLocal('access_token', res.object.access_token);
      return true;
    } else {
      this.message(res.message, 'danger');
      return false;
    }
  }).catch((res: any) => {
    return this.handlerError(res)
  });
}
async register(body, confirm = false) {
  this.loading = true;
  return this.http.post(this.settingsService.Settings.endpoint + (confirm ? 'api/active' : 'api/register'), body, {headers: this.headers}).toPromise().then((res: any) => {
    this.loading = false;
    if (res.status === 200) {
      this.message(res.message, 'success');
      return true;
    } else {
      this.message(res.message, 'danger');
      return false;
    }
  }).catch((res: any) => {
    return this.handlerError(res)
  });
}
setLocal(name: string, content: string, encript: boolean = false) {
  try {
    localStorage.setItem(name, encript ? window.btoa(content) : content);
  } catch (error) {
    console.error(error);
  }
}
getLocal(name: string, encript: boolean = false) {
  try {
    return localStorage.getItem(encript ? window.btoa(name) : name);
  } catch (error) {
    console.error(error);
  }
}
async getFile({resource}) {
  return new Promise( (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('get', resource);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = () => {
        reject({
          status: 500,
          statusText: xhr.statusText
        });
      };
      xhr.send();
  });
}
public async post(path: string = '', body: any, loading = true) {
  this.loading = loading ? true : false;
  const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('access_token'));
  return this.http.post(this.settingsService.Settings.endpoint + path, body, {headers: headers}).toPromise().then(res => {
    this.loading = false;
    return this.calculateRequest(res);
  }).catch((res: any) => {
    return this.handlerError(res)
  });
}
private calculateRequest(res: any) {
  try {
      if (res.message === 'Unauthenticated.') {
          this.message('The session was expired', 'danger');
          localStorage.removeItem(btoa('access_token'));
          setTimeout(() => {
              location.reload();
          }, 3000);
      }
  } catch (error) {
      console.log(error);
  }
  return res;
}
  private handlerError(res: any): void {
      console.log(res);
      if (res.status === 401) {
        this.message('Session expirada', 'danger');
          localStorage.removeItem('access_token');
          setTimeout(() => {
              location.reload();
          }, 3000);
      } else {
        this.message('No hay conexión', 'danger');
      }
      return res;
  }
get isLogged() {
        return localStorage.getItem('access_token') ? true : false;
    }
  get isMobile() {
    return window.innerWidth <= 768;
    //return window.innerWidth <= 991;
}
get decodedToken() {
  try{
      if (!this._decodedToken) {
          //this._decodedToken = jwtDecode('bearer ' + this.cache.data.accessToken).data;
      }
      return this._decodedToken;
  } catch(ex){
  }
  return null;
}
}
