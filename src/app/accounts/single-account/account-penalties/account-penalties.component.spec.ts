import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPenaltiesComponent } from './account-penalties.component';

describe('AccountPenaltiesComponent', () => {
  let component: AccountPenaltiesComponent;
  let fixture: ComponentFixture<AccountPenaltiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPenaltiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPenaltiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
