import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosUserHistoryComponent } from './pos-user-history.component';

describe('PosUserHistoryComponent', () => {
  let component: PosUserHistoryComponent;
  let fixture: ComponentFixture<PosUserHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosUserHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosUserHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
