import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodPassesComponent } from './period-passes.component';

describe('PeriodPassesComponent', () => {
  let component: PeriodPassesComponent;
  let fixture: ComponentFixture<PeriodPassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodPassesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodPassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
