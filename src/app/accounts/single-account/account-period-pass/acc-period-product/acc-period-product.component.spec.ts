import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccPeriodProductComponent } from './acc-period-product.component';

describe('AccPeriodProductComponent', () => {
  let component: AccPeriodProductComponent;
  let fixture: ComponentFixture<AccPeriodProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccPeriodProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccPeriodProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
