import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountRiderComponent } from './account-rider.component';

describe('AccountRiderComponent', () => {
  let component: AccountRiderComponent;
  let fixture: ComponentFixture<AccountRiderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountRiderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountRiderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
