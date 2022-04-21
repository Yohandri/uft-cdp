import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

class Settings {
    public endpoint = '';
  public Subscriptions: string;
  public Blob: string;
  public BlobLogo: string;
  public max_num_cuotas: number;
  public horas_materias: number[];
  public iva: number = 0;
  setURL = (obj: Settings, ApiVersion: string, Blob: string, BlobLogo) => {
    this.Subscriptions = `${obj.Subscriptions}api/v${ApiVersion}`;
    this.Blob = Blob;
    this.BlobLogo = BlobLogo;
  }
}

@Injectable()
export class SettingsService {
  public Settings: Settings = new Settings();
  public CompanyAlias: string;
  public ApiVersion: string;
  public News: string;
  constructor(
    public http: HttpClient
  ) { }
  public async load(): Promise<Settings> {
    return await this.getJson('assets/appsettings.json').then(res => this.extractData(res));
  }
  private extractData(res: any) {
    const body = res;
    this.Settings.endpoint = body.InertiaApiUrl;
    this.Settings.iva = body.iva;
    this.Settings.max_num_cuotas = body.max_num_cuotas ? body.max_num_cuotas : 15;
    this.Settings.horas_materias = body.horas_materias ? body.horas_materias : [2,3,4,5,6,7,8];
    return this.Settings;
    // const env = localStorage.getItem(window.btoa('env')) ?
    // window.atob(localStorage.getItem(window.btoa('env'))) : 'default' ;
    // this.ApiVersion = body.ApiVersion !== undefined ? body.ApiVersion : '1';
    // let blob;
    // console.log(env);
    // if (localStorage.getItem(window.btoa('ApiVersion')) !== null) {
    //   this.ApiVersion = window.atob(localStorage.getItem(window.btoa('ApiVersion')));
    // }
    // this.News = body.News !== undefined ? body.News : '';
    // this.CompanyAlias = body.CompanyAlias !== undefined ? body.CompanyAlias : document.domain.split('.')[0];
    // if (env === 'default') {
    //   blob = body.BlobProd;
    // }
    // if (env === 'test') {
    //   blob = body.BlobTest;
    // }
    // if (environment.production) {
    //   this.Settings.setURL(body, this.ApiVersion, blob, body.BlobProd);
    // } else {
    //   const obj: any = {Subscriptions: environment.baseUrl.subscription, Blob: blob};
    //   this.Settings.setURL(obj, this.ApiVersion, blob, body.BlobProd);
    // }
    // return this.Settings;
  }
  public async getJson(path): Promise<any> {
    return await this.http.get(path).toPromise().then(res => res).catch(() => new Settings());
  }
}
