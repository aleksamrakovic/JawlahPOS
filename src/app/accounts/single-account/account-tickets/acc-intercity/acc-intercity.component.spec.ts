import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccIntercityComponent } from './acc-intercity.component';

describe('AccIntercityComponent', () => {
  let component: AccIntercityComponent;
  let fixture: ComponentFixture<AccIntercityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccIntercityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccIntercityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
