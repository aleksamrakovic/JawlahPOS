import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountVerifyScratchComponent } from './account-verify-scratch.component';

describe('AccountVerifyScratchComponent', () => {
  let component: AccountVerifyScratchComponent;
  let fixture: ComponentFixture<AccountVerifyScratchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountVerifyScratchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountVerifyScratchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
