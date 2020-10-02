import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodCityComponent } from './period-city.component';

describe('PeriodCityComponent', () => {
  let component: PeriodCityComponent;
  let fixture: ComponentFixture<PeriodCityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodCityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
