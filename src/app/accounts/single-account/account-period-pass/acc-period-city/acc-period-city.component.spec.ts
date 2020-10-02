import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccPeriodCityComponent } from './acc-period-city.component';

describe('AccPeriodCityComponent', () => {
  let component: AccPeriodCityComponent;
  let fixture: ComponentFixture<AccPeriodCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccPeriodCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccPeriodCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
