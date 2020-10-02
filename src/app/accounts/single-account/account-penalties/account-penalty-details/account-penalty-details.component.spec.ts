import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPenaltyDetailsComponent } from './account-penalty-details.component';

describe('AccountPenaltyDetailsComponent', () => {
  let component: AccountPenaltyDetailsComponent;
  let fixture: ComponentFixture<AccountPenaltyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPenaltyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPenaltyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
