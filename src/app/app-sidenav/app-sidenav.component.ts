import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { ActivatedRoute, Router, ChildActivationEnd, NavigationEnd, ActivationEnd, RouterEvent } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sidenav',
  templateUrl: './app-sidenav.component.html',
  styleUrls: ['./app-sidenav.component.css']
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
    private titleService: Title) {}

    ngOnInit(){
      this.router.events
      .pipe(filter(e => e instanceof ActivationEnd))
      .subscribe((event: ActivationEnd) =>{ 
        this.title = event.snapshot.data.title;
        this.titleService.setTitle(`HBR Selfie | ${this.title}`);
      });
    }
  }
