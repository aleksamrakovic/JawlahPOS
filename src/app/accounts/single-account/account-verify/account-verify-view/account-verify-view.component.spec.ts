import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountVerifyViewComponent } from './account-verify-view.component';

describe('AccountVerifyViewComponent', () => {
  let component: AccountVerifyViewComponent;
  let fixture: ComponentFixture<AccountVerifyViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountVerifyViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountVerifyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
