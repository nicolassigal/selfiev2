import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirwaybillsComponent } from './airwaybills.component';

describe('AirwaybillsComponent', () => {
  let component: AirwaybillsComponent;
  let fixture: ComponentFixture<AirwaybillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirwaybillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirwaybillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
