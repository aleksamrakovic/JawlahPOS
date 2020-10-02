import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosUserComponent } from './pos-user.component';

describe('PosUserComponent', () => {
  let component: PosUserComponent;
  let fixture: ComponentFixture<PosUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
