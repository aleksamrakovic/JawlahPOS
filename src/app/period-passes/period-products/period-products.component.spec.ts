import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodProductsComponent } from './period-products.component';

describe('PeriodProductsComponent', () => {
  let component: PeriodProductsComponent;
  let fixture: ComponentFixture<PeriodProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
