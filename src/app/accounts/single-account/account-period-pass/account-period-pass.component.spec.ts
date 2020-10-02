import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPeriodPassComponent } from './account-period-pass.component';

describe('AccountPeriodPassComponent', () => {
  let component: AccountPeriodPassComponent;
  let fixture: ComponentFixture<AccountPeriodPassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPeriodPassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPeriodPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
