import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HbrTableComponent } from './hbr-table.component';

describe('HbrTableComponent', () => {
  let component: HbrTableComponent;
  let fixture: ComponentFixture<HbrTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HbrTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HbrTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
