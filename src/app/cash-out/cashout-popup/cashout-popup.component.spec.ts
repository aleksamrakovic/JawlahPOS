import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashoutPopupComponent } from './cashout-popup.component';

describe('CashoutPopupComponent', () => {
  let component: CashoutPopupComponent;
  let fixture: ComponentFixture<CashoutPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashoutPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashoutPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
