import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccPaymentsDetailsComponent } from './acc-payments-details.component';

describe('AccPaymentsDetailsComponent', () => {
  let component: AccPaymentsDetailsComponent;
  let fixture: ComponentFixture<AccPaymentsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccPaymentsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccPaymentsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
