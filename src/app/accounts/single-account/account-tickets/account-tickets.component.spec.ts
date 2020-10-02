import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTicketsComponent } from './account-tickets.component';

describe('AccountTicketsComponent', () => {
  let component: AccountTicketsComponent;
  let fixture: ComponentFixture<AccountTicketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountTicketsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
