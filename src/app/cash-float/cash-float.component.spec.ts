import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFloatComponent } from './cash-float.component';

describe('CashFloatComponent', () => {
  let component: CashFloatComponent;
  let fixture: ComponentFixture<CashFloatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashFloatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFloatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
