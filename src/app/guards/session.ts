import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SystemService } from '../services/system.service';

@Injectable({
    providedIn: 'root'
})
export class SessionGuard implements CanActivate {
    constructor(
        private system: SystemService,
        public router: Router
    ) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (!this.system.isLogged) {
            this.router.navigate(['']);
            return false;
        } else {
            return true;
        }
    }
}
@Injectable({
    providedIn: 'root'
})
// export class AdminGuard implements CanActivate {
//     constructor(
//         private system: SystemService,
//         public router: Router
//     ) { }
//     canActivate(
//         next: ActivatedRouteSnapshot,
//         state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//         if (!this.system.isLogged) {
//             this.router.navigate(['login']);
//             return false;
//         } else {
//             console.log(this.system.decodedToken.role);
//             if (this.system.decodedToken.role === 'administrator') {
//                 return true;
//             } else {
//                 if(this.system.decodedToken.role === 'shopper') {
//                     this.router.navigate(['product']);
//                     return false;
//                 }
//                 if(this.system.decodedToken.role === 'driver' || this.system.decodedToken.role === 'picker') {
//                     this.router.navigate(['orders']);
//                     return false;
//                 }
//                 return false;
//             }
//         }
//     }
// }
@Injectable({
    providedIn: 'root'
})
export class shopperGuard implements CanActivate {
    constructor(
        private system: SystemService,
        public router: Router
    ) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (!this.system.isLogged) {
            this.router.navigate(['login']);
            return false;
        } else {
            console.log(this.system.decodedToken.role);
            if (this.system.decodedToken.role === 'shopper' || this.system.decodedToken.role === 'administrator') {
                return true;
            } else {
                if (this.system.decodedToken.role === 'driver' || this.system.decodedToken.role === 'picker') {
                    this.router.navigate(['orders']);
                }
                return false;
            }
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class StudentGuard implements CanActivate {
    constructor(
        private system: SystemService,
        public router: Router
    ) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        
        if (this.system.isStudent) {
            return true;
        } else {
            return false;
        }
    }
}
@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(
        private system: SystemService,
        public router: Router
    ) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        
        if (this.system.isAdministrator) {
            return true;
        } else {
            return false;
        }
    }
}
