import { AngularFireAuth } from 'angularfire2/auth';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor ( private router: Router, private auth: AngularFireAuth) {}
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      return true;
      // this.router.navigate(['login']);
    
  }
}