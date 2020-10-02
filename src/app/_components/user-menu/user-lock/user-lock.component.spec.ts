import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLockComponent } from './user-lock.component';

describe('UserLockComponent', () => {
  let component: UserLockComponent;
  let fixture: ComponentFixture<UserLockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserLockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
