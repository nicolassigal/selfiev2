import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidenav',
  templateUrl: './app-sidenav.component.html',
  styleUrls: ['./app-sidenav.component.css']
})
export class AppSidenavComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.Handset,
    Breakpoints.Tablet,
    Breakpoints.Small,
    Breakpoints.Medium
  ]).pipe(map(result => result.matches));

  constructor(private breakpointObserver: BreakpointObserver) {}

  }
