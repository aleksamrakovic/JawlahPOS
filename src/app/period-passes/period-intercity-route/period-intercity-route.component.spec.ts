import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodIntercityRouteComponent } from './period-intercity-route.component';

describe('PeriodIntercityRouteComponent', () => {
  let component: PeriodIntercityRouteComponent;
  let fixture: ComponentFixture<PeriodIntercityRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodIntercityRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodIntercityRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
