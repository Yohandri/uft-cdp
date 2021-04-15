import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwtDecode  from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class SystemService {
  sidebarOn = false;
  private _decodedToken;
  module = '';
  constructor(
    public router: Router
  ) { }

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
