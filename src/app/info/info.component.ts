import { Component, OnInit } from '@angular/core';
import { InfoService } from './info.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  content;
  constructor(private infoService: InfoService) { }
  ngOnInit() {
    this.infoService.infoSubject.subscribe(data => this.parseHTML(data));
  }

  parseHTML = (data) => {
    this.content = data;
  }
}
