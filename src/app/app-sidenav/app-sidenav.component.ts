import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { ActivatedRoute, Router, ChildActivationEnd, NavigationEnd, ActivationEnd, RouterEvent } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './app-sidenav.component.html',
  styleUrls: ['./app-sidenav.component.scss']
})
export class AppSidenavComponent implements OnInit {
  title;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.Handset,
    Breakpoints.Tablet,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(map(result => result.matches));

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private titleService: Title,
    private authService: AuthService) {}

    ngOnInit() {
      this.router.events
      .pipe(filter(e => e instanceof ActivationEnd))
      .subscribe((event: ActivationEnd) =>{
        if(event.snapshot.data.title) {
          this.title =  event.snapshot.data.title;
        }
        this.titleService.setTitle(`HBR Selfie | ${this.title}`);
      });
    }

    checkRole = (roles) => {
      return this.authService._isAuthorized(roles);
    }

    logOut = () => {
      this.authService._logOut().then(res => {
        this.authService._clear();
        this.router.navigate(['login']);
      });
    }
  }
