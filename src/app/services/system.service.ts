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
  changePass = new ChangePass();
  dolar = new DolarStatus();
  isSolvente = false;
  saldo = '';
  constructor(
    public router: Router,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public settingsService: SettingsService
  ) {
    if (this.isLogged) {
      this.getFile({resource: 'https://s3.amazonaws.com/dolartoday/data.json'}).then(((res) => {
            try {
                if (res) {
                  const data = JSON.parse(res) as any;
                    // this.settings = JSON.parse(res) as any;
                    // this.endpoint = this.settings.InertiaApiUrl;
                    console.log(data);
                    this.dolar.setUSD(data.USD);
                }
            }  catch (ex) {
                return ex;
            } finally {
            }
        }).bind(this));
    }
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
async forgetPassword(body) {
  this.loading = true;
  return this.http.post(this.settingsService.Settings.endpoint + 'api/forgetPassword', body, {headers: this.headers}).toPromise().then((res: any) => {
    this.loading = false;
    if (res.status === 200) {
      this.message(res.message, 'success');
      //this.setLocal('access_token', res.object.access_token);
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
public async get(path: string = '', body: any, loading = true) {
  this.loading = loading ? true : false;
  const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('access_token'));
  return this.http.get(this.settingsService.Settings.endpoint + path, body).toPromise().then(res => {
    this.loading = false;
    return this.calculateRequest(res);
  }).catch((res: any) => {
    return this.handlerError(res)
  });
}
public async getDownloadFile(path: string = '',body: any, loading = true) {
  this.loading = loading ? true : false;
  const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('access_token')).append('Accept','application/xlsx').append('responseType','blob');
  this.http.get(`${this.settingsService.Settings.endpoint + path}`,{
    responseType: 'arraybuffer', headers:headers} 
   ).subscribe(response => this.downLoadFile(response, "application/ms-excel", body));
}
downLoadFile(data: any, type: string, body) {
  this.loading = false;
  let blob = new Blob([data], { type: type});
  // let url = window.URL.createObjectURL(blob);
  // let pwa = window.open(url);
  var link=document.createElement('a');
  link.href=window.URL.createObjectURL(blob);
  link.download="Pagos_" + body.from + '_' + body.to +".xlsx";
  link.click();

  

  // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
  //     alert( 'Please disable your Pop-up blocker and try again.');
  // }
}
s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
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
  getStatus() {
    console.log(this?.decodedToken);
    if (this.isStudent) {
      this.get('api/estudiante?ci=' + this?.decodedToken?.user?.ci,{}, false).then(res => {
        try {
          console.log(res);
          if (res.status === 200) {
            this.isSolvente = res.object.solvente;
          } else {
            this.isSolvente = null;
          }
        } catch (error) { 
          console.log(error);
        }
      });
    }
  }
  async getSaldo() {
    await this.post('api/estudiante/saldo', {}, true).then(res => {
       try {
         if (res.status === 200) {
           console.log(res);
           this.saldo = res.object;
           return true;
         } else {
           return false;
         }
       } catch (error) {
         return false;
       }
     });
  }
  async changePassword() {
    console.log(this.changePass, this.changePass.valid());
    //const loadingGuid = this.startLoading();
    try {
        if (this.changePass.valid()) {
            this.changePass.setCedula(this.decodedToken?.user?.ci);
            const res = await this.post('api/changepassword',this.changePass);
            console.log(res);
            this.changePass.reset();
            if (res.status === 200) {
                this.message(res.message, 'success');
            } else if (res.status === 500) {
                this.message(res.message, 'danger');
            }
        }            
    } catch (error) {
        console.log(error);
    } finally {
      //  this.stopLoading(loadingGuid);
    }
}
toBs(dolar) {
  try {
    return (this.dolar.valor * dolar);
  } catch (error) {
    return dolar;
  }
}
toD(bs) {
  try {
    return (bs / this.dolar.valor);
  } catch (error) {
    return bs;
  }
}
toPetro(dolar) {
  try {
    return (dolar / 60).toFixed(2);
  } catch (error) {
    return dolar;
  }
}
get isLogged() {
        return localStorage.getItem('access_token') ? true : false;
    }
  get isMobile() {
    return window.innerWidth <= 768;
    //return window.innerWidth <= 991;
}
get isStudent() {
  try {
    return this.decodedToken?.user?.profile_id === 3;
  } catch (error) {
    return false;
  }
}
get isAdministrator() {
  try {
    return this.decodedToken?.user?.profile_id === 1 || this.decodedToken?.user?.profile_id === 2;
  } catch (error) {
    return false;
  }
}
get isAdministrativo() {
  try {
    return this.decodedToken?.user?.profile_id === 2;
  } catch (error) {
    return false;
  }
}
get decodedToken() {
  try{
      if (!this._decodedToken) {
          //this._decodedToken = jwtDecode('bearer ' + this.cache.data.accessToken).data;
      }
      const token = localStorage.getItem('access_token');
      if (token) {
        return jwtDecode(token);
      } else {
        return this._decodedToken;
      }
  } catch(ex){
  }
  return null;
}
}
class ChangePass {
  public password = '';
  public newpassword = '';
  public repeatpassword = '';
  public ci = '';
  constructor() {}
  reset() {
      this.password = '';
      this.newpassword = '';
      this.repeatpassword = '';
  }
  valid() {
      return this.newpassword !== '' && this.newpassword.length > 5 ? this.newpassword === this.repeatpassword ? true : false : false
  }
  setCedula(ci) {
    this.ci = ci;
  }
}
interface USD {
  sicad2?:number;
}
class DolarStatus {
  public USD: USD = {};
  public valor = 0;
  constructor() {}
  setUSD(data) {
    try {
      this.USD = data;
      this.valor = this.USD?.sicad2;
    } catch (error) {
      this.USD = {};
      this.valor = 0;
    }
  }
}