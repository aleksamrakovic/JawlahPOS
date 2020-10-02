import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodIntercityComponent } from './period-intercity.component';

describe('PeriodIntercityComponent', () => {
  let component: PeriodIntercityComponent;
  let fixture: ComponentFixture<PeriodIntercityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodIntercityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodIntercityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
