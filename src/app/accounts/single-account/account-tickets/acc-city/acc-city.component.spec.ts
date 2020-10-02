import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccCityComponent } from './acc-city.component';

describe('AccCityComponent', () => {
  let component: AccCityComponent;
  let fixture: ComponentFixture<AccCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
